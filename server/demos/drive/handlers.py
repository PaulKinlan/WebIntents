#!/usr/bin/python
#
# Copyright (C) 2012 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

__author__ = 'afshar@google.com (Ali Afshar)'

# Add the library location to the path
import sys
sys.path.insert(0, 'lib')

import os
import httplib2
import sessions
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from apiclient.discovery import build
from apiclient.http import MediaUpload
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from oauth2client.client import AccessTokenRefreshError
from oauth2client.appengine import CredentialsProperty
from oauth2client.appengine import StorageByKeyName
from oauth2client.appengine import simplejson as json

ALL_SCOPES = ('https://www.googleapis.com/auth/drive.file '
              'https://www.googleapis.com/auth/userinfo.email '
              'https://www.googleapis.com/auth/userinfo.profile')

def SibPath(name):
  """Generate a path that is a sibling of this file.

  Args:
    name: Name of sibling file.
  Returns:
    Path to sibling file.
  """
  return os.path.join(os.path.dirname(__file__), name)

# Load the secret that is used for client side sessions
# Create one of these for yourself with, for example:
# python -c "import os; print os.urandom(64)" > session.secret
SESSION_SECRET = open(SibPath('session.secret')).read()

class Credentials(db.Model):
  """Datastore entity for storing OAuth2.0 credentials.

  The CredentialsProperty is provided by the Google API Python Client, and is
  used by the Storage classes to store OAuth 2.0 credentials in the data store."""
  credentials = CredentialsProperty()

def CreateService(service, version, creds):
  """Create a Google API service.

  Load an API service from the Discovery API and authorize it with the
  provided credentials.

  Args:
    service: Request service (e.g 'drive', 'oauth2').
    version: Version of the service (e.g 'v1').
    creds: Credentials used to authorize service.
  Returns:
    Authorized Google API service.
  """
  # Instantiate an Http instance
  http = httplib2.Http()

  # Authorize the Http instance with the passed credentials
  creds.authorize(http)

  # Build a named service from the Discovery API
  return build(service, version, http=http)

class DriveState(object):
  """Store state provided by Drive."""

  def __init__(self, state):
    """Create a new instance of drive state.

    Parse and load the JSON state parameter.

    Args:
      state: State query parameter as a string.
    """
    state_data = json.loads(state)
    self.action = state_data['action']
    self.ids = map(str, state_data.get('ids', []))

  @classmethod
  def FromRequest(cls, request):
    """Create a Drive State instance from an HTTP request.

    Args:
      cls: Type this class method is called against.
      request: HTTP request.
    """
    return DriveState(request.get('state'))

class BaseDriveHandler(webapp.RequestHandler):
  """Base request handler for drive applications.

  Adds Authorization support for Drive.
  """

  def CreateOAuthFlow(self):
    """Create OAuth2.0 flow controller

    This controller can be used to perform all parts of the OAuth 2.0 dance
    including exchanging an Authorization code.

    Args:
      request: HTTP request to create OAuth2.0 flow for
    Returns:
      OAuth2.0 Flow instance suitable for performing OAuth2.0.
    """
    flow = flow_from_clientsecrets('client-debug.json', scope='')
    # Dynamically set the redirect_uri based on the request URL. This is extremely
    # convenient for debugging to an alternative host without manually setting the
    # redirect URI.
    flow.redirect_uri = self.request.url.split('?', 1)[0].rsplit('/', 1)[0]
    return flow

  def GetCodeCredentials(self):
    """Create OAuth 2.0 credentials by extracting a code and performing OAuth2.0.

    The authorization code is extracted form the URI parameters. If it is absent,
    None is returned immediately. Otherwise, if it is present, it is used to
    perform step 2 of the OAuth 2.0 web server flow.

    Once a token is received, the user information is fetched from the userinfo
    service and stored in the session. The token is saved in the datastore against
    the user ID received from the userinfo service.

    Args:
      request: HTTP request used for extracting an authorization code and the
               session information.
    Returns:
      OAuth2.0 credentials suitable for authorizing clients or None if
      Authorization could not take place.
    """
    # Other frameworks use different API to get a query parameter.
    code = self.request.get('code')
    if not code:
      # returns None to indicate that no code was passed from Google Drive.
      return None

    # Auth flow is a controller that is loaded with the client information,
    # including client_id, client_secret, redirect_uri etc
    oauth_flow = self.CreateOAuthFlow()

    # Perform the exchange of the code. If there is a failure with exchanging
    # the code, return None.
    try:
      creds = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
      return None

    # Create an API service that can use the userinfo API. Authorize it with our
    # credentials that we gained from the code exchange.
    users_service = CreateService('oauth2', 'v2', creds)

    # Make a call against the userinfo service to retrieve the user's information.
    # In this case we are interested in the user's "id" field.
    userid = users_service.userinfo().get().execute().get('id')

    # Store the user id in the user's cookie-based session.
    session = sessions.LilCookies(self, SESSION_SECRET)
    session.set_secure_cookie(name='userid', value=userid)

    # Store the credentials in the data store using the userid as the key.
    StorageByKeyName(Credentials, userid, 'credentials').put(creds)
    return creds

  def GetSessionCredentials(self):
    """Get OAuth 2.0 credentials for an HTTP session.

    If the user has a user id stored in their cookie session, extract that value
    and use it to load that user's credentials from the data store.

    Args:
      request: HTTP request to use session from.
    Returns:
      OAuth2.0 credentials suitable for authorizing clients.
    """
    # Try to load  the user id from the session
    session = sessions.LilCookies(self, SESSION_SECRET)
    userid = session.get_secure_cookie(name='userid')
    if not userid:
      # return None to indicate that no credentials could be loaded from the
      # session.
      return None

    # Load the credentials from the data store, using the userid as a key.
    creds = StorageByKeyName(Credentials, userid, 'credentials').get()

    # if the credentials are invalid, return None to indicate that the credentials
    # cannot be used.
    if creds and creds.invalid:
      return None

    return creds

  def RedirectAuth(self):
    """Redirect a handler to an authorization page.

    Used when a handler fails to fetch credentials suitable for making Drive API
    requests. The request is redirected to an OAuth 2.0 authorization approval
    page and on approval, are returned to application.

    Args:
      handler: webapp.RequestHandler to redirect.
    """
    flow = self.CreateOAuthFlow()

    # Manually add the required scopes. Since this redirect does not originate
    # from the Google Drive UI, which authomatically sets the scopes that are
    # listed in the API Console.
    flow.scope = ALL_SCOPES

    # Create the redirect URI by performing step 1 of the OAuth 2.0 web server
    # flow.
    uri = flow.step1_get_authorize_url(flow.redirect_uri)

    # Perform the redirect.
    self.redirect(uri)

class MainPage(BaseDriveHandler):
  """Web handler for the main page.

  Handles requests and returns the user interface for Open with and Create
  cases. Responsible for parsing the state provided from the Drive UI and acting
  appropriately.
  """

  def get(self):
    """Handle GET for Create New and Open with.

    This creates an authorized client, and checks whether a resource id has
    been passed or not. If a resource ID has been passed, this is the Open
    With use-case, otherwise it is the Create New use-case.
    """
    # Fetch the credentials by extracting an OAuth 2.0 authorization code from
    # the request URL. If the code is not present, redirect to the OAuth 2.0
    # authorization URL.
    creds = self.GetCodeCredentials()
    if not creds:
      return self.RedirectAuth()

    # Extract the numerical portion of the client_id from the stored value in
    # the OAuth flow. You could also store this value as a separate variable
    # somewhere.
    client_id = self.CreateOAuthFlow().client_id.split('.')[0].split('-')[0]

    # Generate a state instance for the request, this includes the action, and
    # the file id(s) that have been sent from the Drive user interface.
    drive_state = DriveState.FromRequest(self.request)
    if drive_state.action == 'open':
      file_ids = [str(i) for i in drive_state.ids]
    else:
      file_ids = ['']
    self.RenderTemplate(file_ids=file_ids, client_id=client_id)

  def RenderTemplate(self, **context):
    """Render a named template in a context.

    Args:
      name: Template name.
      context: Keyword arguments to render as template variables.
    """
    self.response.headers['Content-Type'] = 'text/html'
    self.response.out.write(template.render('index.html', context))

class ServiceHandler(BaseDriveHandler):
  """Web handler for the service to read and write to Drive."""

  def post(self):
    """Called when HTTP POST requests are received by the web application.

    The POST body is JSON which is deserialized and used as values to create a
    new file in Drive. The authorization access token for this action is
    retreived from the data store.
    """
    # Create a Drive service
    service = self.CreateDrive()
    if service is None:
      return

    # Load the data that has been posted as JSON
    data = self.RequestJSON()

    # Create a new file data structure.
    resource = {
      'title': data['title'],
      'description': data['description'],
      'mimeType': data['mimeType'],
    }
    try:
      # Make an insert request to create a new file. A MediaInMemoryUpload
      # instance is used to upload the file body.
      resource = service.files().insert(
          body=resource,
          media_body=MediaInMemoryUpload(data.get('content', ''),
                                         data['mimeType']),
      ).execute()
      # Respond with the new file id as JSON.
      self.RespondJSON(resource['id'])
    except AccessTokenRefreshError:
      # In cases where the access token has expired and cannot be refreshed
      # (e.g. manual token revoking) redirect the user to the authorization page
      # to authorize.
      self.RedirectAuth()

  def get(self):
    """Called when HTTP GET requests are received by the web application.

    Use the query parameter file_id to fetch the required file's metadata then
    content and return it as a JSON object.

    Since DrEdit deals with text files, it is safe to dump the content directly
    into JSON, but this is not the case with binary files, where something like
    Base64 encoding is more appropriate.
    """
    # Create a Drive service
    service = self.CreateDrive()
    if service is None:
      return
    try:
      # Requests are expected to pass the file_id query parameter.
      file_id = self.request.get('file_id')
      if file_id:
        # Fetch the file metadata by making the service.files().get method of
        # the Drive API.
        f = service.files().get(id=file_id).execute()
        downloadUrl = f.get('downloadUrl')
        # If a download URL is provided in the file metadata, use it to make an
        # authorized request to fetch the file ontent. Set this content in the
        # data to return as the 'content' field. If there is no downloadUrl,
        # just set empty content.
        if downloadUrl:
          resp, f['content'] = service._http.request(downloadUrl)
        else:
          f['content'] = ''
      else:
        f = None
      # Generate a JSON response with the file data and return to the client.
      self.RespondJSON(f)
    except AccessTokenRefreshError:
      # Catch AccessTokenRefreshError which occurs when the API client library
      # fails to refresh a token. This occurs, for example, when a refresh token
      # is revoked. When this happens the user is redirected to the
      # Authorization URL.
      self.RedirectAuth()

  def put(self):
    """Called when HTTP PUT requests are received by the web application.

    The PUT body is JSON which is deserialized and used as values to update
    a file in Drive. The authorization access token for this action is
    retreived from the data store.
    """
    # Create a Drive service
    service = self.CreateDrive()
    if service is None:
      return
    # Load the data that has been posted as JSON
    data = self.RequestJSON()
    try:
      # Create a new file data structure.
      resource = {
        'title': data['title'] or 'Untitled Document',
        'description': data['description'],
        'mimeType': data['mimeType'],
      }
      # Make an update request to update the file. A MediaInMemoryUpload
      # instance is used to upload the file body. Because of a limitation, this
      # request must be made in two parts, the first to update the metadata, and
      # the second to update the body.
      resource = service.files().update(
        id=data['resource_id'],
        newRevision=False,
        body=resource,
        media_body=None,
      ).execute()
      resource = service.files().update(
        id=data['resource_id'],
        newRevision=True,
        body=None,
        media_body=MediaInMemoryUpload(data.get('content', ''),
                                             data['mimeType']),
      ).execute()
      # Respond with the new file id as JSON.
      self.RespondJSON(resource['id'])
    except AccessTokenRefreshError:
      # In cases where the access token has expired and cannot be refreshed
      # (e.g. manual token revoking) redirect the user to the authorization page
      # to authorize.
      self.RedirectAuth()

  def CreateDrive(self):
    """Create a drive client instance.

    The service can only ever retrieve the credentials from the session.
    """
    # For the service, the session holds the credentials
    creds = self.GetSessionCredentials()
    if creds:
      # If the session contains credentials, use them to create a Drive service
      # instance.
      return CreateService('drive', 'v1', creds)
    else:
      # If no credentials could be loaded from the session, redirect the user to
      # the authorization page.
      self.RedirectAuth()

  def RedirectAuth(self):
    """Redirect a handler to an authorization page.

    Used when a handler fails to fetch credentials suitable for making Drive API
    requests. The request is redirected to an OAuth 2.0 authorization approval
    page and on approval, are returned to application.

    Args:
      handler: webapp.RequestHandler to redirect.
    """
    flow = self.CreateOAuthFlow()

    # Manually add the required scopes. Since this redirect does not originate
    # from the Google Drive UI, which authomatically sets the scopes that are
    # listed in the API Console.
    flow.scope = ALL_SCOPES

    # Create the redirect URI by performing step 1 of the OAuth 2.0 web server
    # flow.
    uri = flow.step1_get_authorize_url(flow.redirect_uri)

    # Perform the redirect.
    self.RespondJSON({'redirect': uri})

  def RespondJSON(self, data):
    """Generate a JSON response and return it to the client.

    Args:
      data: The data that will be converted to JSON to return.
    """
    # Set the content type to JSON's
    self.response.headers['Content-Type'] = 'application/json'
    # Write the response body as JSON
    self.response.out.write(json.dumps(data))

  def RequestJSON(self):
    """Load the request body as JSON.

    Returns:
      Request body loaded as JSON or None if there is no request body.
    """
    if self.request.body:
      return json.loads(self.request.body)

class MediaInMemoryUpload(MediaUpload):
  """MediaUpload for a chunk of bytes.

  Construct a MediaFileUpload and pass as the media_body parameter of the
  method. For example, if we had a service that allowed plain text:
  """

  def __init__(self, body, mimetype='application/octet-stream',
               chunksize=256*1024, resumable=False):
    """Create a new MediaBytesUpload.

    Args:
      body: string, Bytes of body content.
      mimetype: string, Mime-type of the file or default of
        'application/octet-stream'.
      chunksize: int, File will be uploaded in chunks of this many bytes. Only
        used if resumable=True.
      resumable: bool, True if this is a resumable upload. False means upload
        in a single request.
    """
    self._body = body
    self._mimetype = mimetype
    self._resumable = resumable
    self._chunksize = chunksize

  def chunksize(self):
    """Chunk size for resumable uploads.

    Returns:
      Chunk size in bytes.
    """
    return self._chunksize

  def mimetype(self):
    """Mime type of the body.

    Returns:
      Mime type.
    """
    return self._mimetype

  def size(self):
    """Size of upload.

    Returns:
      Size of the body.
    """
    return len(self._body)

  def resumable(self):
    """Whether this upload is resumable.

    Returns:
      True if resumable upload or False.
    """
    return self._resumable

  def getbytes(self, begin, length):
    """Get bytes from the media.

    Args:
      begin: int, offset from beginning of file.
      length: int, number of bytes to read, starting at begin.

    Returns:
      A string of bytes read. May be shorter than length if EOF was reached
      first.
    """
    return self._body[begin:begin + length]
