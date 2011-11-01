#!/usr/bin/env python

"""
A simple OAuth implementation for authenticating users with third party
websites.

A typical use case inside an AppEngine controller would be:

1) Create the OAuth client. In this case we'll use the Twitter client,
  but you could write other clients to connect to different services.

  import oauth

  consumer_key = "LKlkj83kaio2fjiudjd9...etc"
  consumer_secret = "58kdujslkfojkjsjsdk...etc"
  callback_url = "http://www.myurl.com/callback/twitter"

  client = oauth.TwitterClient(consumer_key, consumer_secret, callback_url)

2) Send the user to Twitter in order to login:

  self.redirect(client.get_authorization_url())

3) Once the user has arrived back at your callback URL, you'll want to
  get the authenticated user information.

  auth_token = self.request.get("oauth_token")
  auth_verifier = self.request.get("oauth_verifier")
  user_info = client.get_user_info(auth_token, auth_verifier=auth_verifier)

  The "user_info" variable should then contain a dictionary of various
  user information (id, picture url, etc). What you do with that data is up
  to you.

  That's it!

4) If you need to, you can also call other other API URLs using
  client.make_request() as long as you supply a valid API URL and an access
  token and secret. Note, you may need to set method=urlfetch.POST.

@author: Mike Knapp
@copyright: Unrestricted. Feel free to use modify however you see fit. Please
note however this software is unsupported. Please don't email me about it. :)
"""

from google.appengine.api import memcache
from google.appengine.api import urlfetch
from google.appengine.ext import db

from cgi import parse_qs
from django.utils import simplejson as json
from hashlib import sha1
from hmac import new as hmac
from random import getrandbits
from time import time
from urllib import urlencode
from urllib import quote as urlquote
from urllib import unquote as urlunquote

import logging


TWITTER = "twitter"
YAHOO = "yahoo"
MYSPACE = "myspace"
DROPBOX = "dropbox"
LINKEDIN = "linkedin"
YAMMER = "yammer"


class OAuthException(Exception):
  pass


def get_oauth_client(service, key, secret, callback_url):
  """Get OAuth Client.

  A factory that will return the appropriate OAuth client.
  """

  if service == TWITTER:
    return TwitterClient(key, secret, callback_url)
  elif service == YAHOO:
    return YahooClient(key, secret, callback_url)
  elif service == MYSPACE:
    return MySpaceClient(key, secret, callback_url)
  elif service == DROPBOX:
    return DropboxClient(key, secret, callback_url)
  elif service == LINKEDIN:
    return LinkedInClient(key, secret, callback_url)
  elif service == YAMMER:
    return YammerClient(key, secret, callback_url)
  else:
    raise Exception, "Unknown OAuth service %s" % service


class AuthToken(db.Model):
  """Auth Token.

  A temporary auth token that we will use to authenticate a user with a
  third party website. (We need to store the data while the user visits
  the third party website to authenticate themselves.)

  TODO: Implement a cron to clean out old tokens periodically.
  """

  service = db.StringProperty(required=True)
  token = db.StringProperty(required=True)
  secret = db.StringProperty(required=True)
  created = db.DateTimeProperty(auto_now_add=True)


class OAuthClient():

  def __init__(self, service_name, consumer_key, consumer_secret, request_url,
               access_url, callback_url=None):
    """ Constructor."""

    self.service_name = service_name
    self.consumer_key = consumer_key
    self.consumer_secret = consumer_secret
    self.request_url = request_url
    self.access_url = access_url
    self.callback_url = callback_url

  def prepare_request(self, url, token="", secret="", additional_params=None,
                      method=urlfetch.GET, t=None, nonce=None):
    """Prepare Request.

    Prepares an authenticated request to any OAuth protected resource.

    Returns the payload of the request.
    """

    def encode(text):
      return urlquote(str(text), "~")

    params = {
      "oauth_consumer_key": self.consumer_key,
      "oauth_signature_method": "HMAC-SHA1",
      "oauth_timestamp": t if t else str(int(time())),
      "oauth_nonce": nonce if nonce else str(getrandbits(64)),
      "oauth_version": "1.0"
    }

    if token:
      params["oauth_token"] = token
    elif self.callback_url:
      params["oauth_callback"] = self.callback_url

    if additional_params:
        params.update(additional_params)

    for k,v in params.items():
        if isinstance(v, unicode):
            params[k] = v.encode('utf8')

    # Join all of the params together.
    params_str = "&".join(["%s=%s" % (encode(k), encode(params[k]))
                           for k in sorted(params)])

    # Join the entire message together per the OAuth specification.
    message = "&".join(["GET" if method == urlfetch.GET else "POST",
                       encode(url), encode(params_str)])

    # Create a HMAC-SHA1 signature of the message.
    key = "%s&%s" % (self.consumer_secret, secret) # Note compulsory "&".
    signature = hmac(key, message, sha1)
    digest_base64 = signature.digest().encode("base64").strip()
    params["oauth_signature"] = digest_base64

    # Construct the request payload and return it
    return urlencode(params)

  def make_async_request(self, url, token="", secret="", additional_params=None,
                         protected=False, method=urlfetch.GET, headers={}):
    """Make Request.

    Make an authenticated request to any OAuth protected resource.

    If protected is equal to True, the Authorization: OAuth header will be set.

    A urlfetch response object is returned.
    """

    payload = self.prepare_request(url, token, secret, additional_params,
                                   method)

    if method == urlfetch.GET:
      url = "%s?%s" % (url, payload)
      payload = None

    if protected:
      headers["Authorization"] = "OAuth"

    rpc = urlfetch.create_rpc(deadline=10.0)
    urlfetch.make_fetch_call(rpc, url, method=method, headers=headers,
                             payload=payload)
    return rpc

  def make_request(self, url, token="", secret="", additional_params=None,
                   protected=False, method=urlfetch.GET, headers={}):

    return self.make_async_request(url, token, secret, additional_params,
                                   protected, method, headers).get_result()

  def get_authorization_url(self):
    """Get Authorization URL.

    Returns a service specific URL which contains an auth token. The user
    should be redirected to this URL so that they can give consent to be
    logged in.
    """

    raise NotImplementedError, "Must be implemented by a subclass"

  def get_user_info(self, auth_token, auth_verifier=""):
    """Get User Info.

    Exchanges the auth token for an access token and returns a dictionary
    of information about the authenticated user.
    """

    auth_token = urlunquote(auth_token)
    auth_verifier = urlunquote(auth_verifier)

    auth_secret = memcache.get(self._get_memcache_auth_key(auth_token))

    if not auth_secret:
      result = AuthToken.gql("""
        WHERE
          service = :1 AND
          token = :2
        LIMIT
          1
      """, self.service_name, auth_token).get()

      if not result:
        logging.error("The auth token %s was not found in our db" % auth_token)
        raise Exception, "Could not find Auth Token in database"
      else:
        auth_secret = result.secret

    response = self.make_request(self.access_url,
                                 token=auth_token,
                                 secret=auth_secret,
                                 additional_params={"oauth_verifier":
                                                     auth_verifier})

    # Extract the access token/secret from the response.
    result = self._extract_credentials(response)

    # Try to collect some information about this user from the service.
    user_info = self._lookup_user_info(result["token"], result["secret"])
    user_info.update(result)

    return user_info

  def _get_auth_token(self):
    """Get Authorization Token.

    Actually gets the authorization token and secret from the service. The
    token and secret are stored in our database, and the auth token is
    returned.
    """

    response = self.make_request(self.request_url)
    result = self._extract_credentials(response)

    auth_token = result["token"]
    auth_secret = result["secret"]

    # Save the auth token and secret in our database.
    auth = AuthToken(service=self.service_name,
                     token=auth_token,
                     secret=auth_secret)
    auth.put()

    # Add the secret to memcache as well.
    memcache.set(self._get_memcache_auth_key(auth_token), auth_secret,
                 time=20*60)

    return auth_token

  def _get_memcache_auth_key(self, auth_token):

    return "oauth_%s_%s" % (self.service_name, auth_token)

  def _extract_credentials(self, result):
    """Extract Credentials.

    Returns an dictionary containing the token and secret (if present).
    Throws an Exception otherwise.
    """

    token = None
    secret = None
    parsed_results = parse_qs(result.content)

    if "oauth_token" in parsed_results:
      token = parsed_results["oauth_token"][0]

    if "oauth_token_secret" in parsed_results:
      secret = parsed_results["oauth_token_secret"][0]

    if not (token and secret) or result.status_code != 200:
      logging.error("Could not extract token/secret: %s" % result.content)
      raise OAuthException("Problem talking to the service")

    return {
      "service": self.service_name,
      "token": token,
      "secret": secret
    }

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Complies a dictionary describing the user. The user should be
    authenticated at this point. Each different client should override
    this method.
    """

    raise NotImplementedError, "Must be implemented by a subclass"

  def _get_default_user_info(self):
    """Get Default User Info.

    Returns a blank array that can be used to populate generalized user
    information.
    """

    return {
      "id": "",
      "username": "",
      "name": "",
      "picture": ""
    }


class TwitterClient(OAuthClient):
  """Twitter Client.

  A client for talking to the Twitter API using OAuth as the
  authentication model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        TWITTER,
        consumer_key,
        consumer_secret,
        "http://api.twitter.com/oauth/request_token",
        "http://api.twitter.com/oauth/access_token",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return "http://api.twitter.com/oauth/authorize?oauth_token=%s" % token

  def get_authenticate_url(self):
    """Get Authentication URL."""
    token = self._get_auth_token()
    return "http://api.twitter.com/oauth/authenticate?oauth_token=%s" % token

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on Twitter.
    """

    response = self.make_request(
        "http://api.twitter.com/account/verify_credentials.json",
        token=access_token, secret=access_secret, protected=True)

    data = json.loads(response.content)

    user_info = self._get_default_user_info()
    user_info["id"] = data["id"]
    user_info["username"] = data["screen_name"]
    user_info["name"] = data["name"]
    user_info["picture"] = data["profile_image_url"]

    return user_info


class MySpaceClient(OAuthClient):
  """MySpace Client.

  A client for talking to the MySpace API using OAuth as the
  authentication model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        MYSPACE,
        consumer_key,
        consumer_secret,
        "http://api.myspace.com/request_token",
        "http://api.myspace.com/access_token",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return ("http://api.myspace.com/authorize?oauth_token=%s"
            "&oauth_callback=%s" % (token, urlquote(self.callback_url)))

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on MySpace.
    """

    response = self.make_request("http://api.myspace.com/v1/user.json",
        token=access_token, secret=access_secret, protected=True)

    data = json.loads(response.content)

    user_info = self._get_default_user_info()
    user_info["id"] = data["userId"]
    username = data["webUri"].replace("http://www.myspace.com/", "")
    user_info["username"] = username
    user_info["name"] = data["name"]
    user_info["picture"] = data["image"]

    return user_info


class YahooClient(OAuthClient):
  """Yahoo! Client.

  A client for talking to the Yahoo! API using OAuth as the
  authentication model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        YAHOO,
        consumer_key,
        consumer_secret,
        "https://api.login.yahoo.com/oauth/v2/get_request_token",
        "https://api.login.yahoo.com/oauth/v2/get_token",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return ("https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=%s"
            % token)

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on Yahoo!
    """

    user_info = self._get_default_user_info()

    # 1) Obtain the user's GUID.
    response = self.make_request(
        "http://social.yahooapis.com/v1/me/guid", token=access_token,
        secret=access_secret, additional_params={"format": "json"},
        protected=True)

    data = json.loads(response.content)["guid"]
    guid = data["value"]

    # 2) Inspect the user's profile.
    response = self.make_request(
        "http://social.yahooapis.com/v1/user/%s/profile/usercard" % guid,
         token=access_token, secret=access_secret,
         additional_params={"format": "json"}, protected=True)

    data = json.loads(response.content)["profile"]

    user_info["id"] = guid
    user_info["username"] = data["nickname"].lower()
    user_info["name"] = data["nickname"]
    user_info["picture"] = data["image"]["imageUrl"]

    return user_info


class DropboxClient(OAuthClient):
  """Dropbox Client.

  A client for talking to the Dropbox API using OAuth as the authentication
  model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        DROPBOX,
        consumer_key,
        consumer_secret,
        "https://api.dropbox.com/0/oauth/request_token",
        "https://api.dropbox.com/0/oauth/access_token",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return ("http://www.dropbox.com/0/oauth/authorize?"
            "oauth_token=%s&oauth_callback=%s" % (token,
                                                  urlquote(self.callback_url)))

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on Dropbox.
    """

    response = self.make_request("http://api.dropbox.com/0/account/info",
                                 token=access_token, secret=access_secret,
                                 protected=True)

    data = json.loads(response.content)
    user_info = self._get_default_user_info()
    user_info["id"] = data["uid"]
    user_info["name"] = data["display_name"]
    user_info["country"] = data["country"]

    return user_info


class LinkedInClient(OAuthClient):
  """LinkedIn Client.

  A client for talking to the LinkedIn API using OAuth as the
  authentication model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        LINKEDIN,
        consumer_key,
        consumer_secret,
        "https://api.linkedin.com/uas/oauth/requestToken",
        "https://api.linkedin.com/uas/oauth/accessToken",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return ("https://www.linkedin.com/uas/oauth/authenticate?oauth_token=%s"
            "&oauth_callback=%s" % (token, urlquote(self.callback_url)))

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on LinkedIn
    """

    user_info = self._get_default_user_info()

    # Grab the user's profile from LinkedIn.
    response = self.make_request("http://api.linkedin.com/v1/people/~:"
                                 "(picture-url,id,first-name,last-name)",
                                 token=access_token,
                                 secret=access_secret,
                                 protected=False,
                                 headers={"x-li-format":"json"})

    data = json.loads(response.content)
    user_info["id"] = data["id"]
    user_info["picture"] = data["pictureUrl"]
    user_info["name"] = data["firstName"] + " " + data["lastName"]
    return user_info


class YammerClient(OAuthClient):
  """Yammer Client.

  A client for talking to the Yammer API using OAuth as the
  authentication model.
  """

  def __init__(self, consumer_key, consumer_secret, callback_url):
    """Constructor."""

    OAuthClient.__init__(self,
        YAMMER,
        consumer_key,
        consumer_secret,
        "https://www.yammer.com/oauth/request_token",
        "https://www.yammer.com/oauth/access_token",
        callback_url)

  def get_authorization_url(self):
    """Get Authorization URL."""

    token = self._get_auth_token()
    return ("https://www.yammer.com/oauth/authorize?oauth_token=%s"
            "&oauth_callback=%s" % (token, urlquote(self.callback_url)))

  def _lookup_user_info(self, access_token, access_secret):
    """Lookup User Info.

    Lookup the user on Yammer
    """

    user_info = self._get_default_user_info()

    # Grab the user's profile from Yammer.
    response = self.make_request("https://www.yammer.com/api/v1/users/current.json",
                                 token=access_token,
                                 secret=access_secret,
                                 protected=False,
                                 headers={"x-li-format":"json"})

    data = json.loads(response.content)
    user_info = self._get_default_user_info()
    user_info["id"] = data["name"]
    user_info["picture"] = data["mugshot_url"]
    user_info["name"] = data["full_name"]
    return user_info
