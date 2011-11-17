#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
# python-twitpic - Dead-simple Twitpic image uploader.

# Copyright (c) 2009, Chris McMichael
# http://chrismcmichael.com/
# http://code.google.com/p/python-twitpic/

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the author nor the names of its contributors may
#       be used to endorse or promote products derived from this software
#       without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS``AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"""
import mimetypes
import os
import urllib
import urllib2
import re

from oauth import oauth
from xml.dom import minidom as xml
from xml.parsers.expat import ExpatError

try:
    import cStringIO as StringIO
except ImportError:
    import StringIO

try:
    import json
except ImportError:
    import simplejson as json


class TwitPicError(Exception):
    """TwitPic Exception"""

    def __init__(self, reason, response=None):
        self.reason = unicode(reason)
        self.response = response

    def __str__(self):
        return self.reason


# Handles Twitter OAuth authentication 
class TwitPicOAuthClient(oauth.OAuthClient):
    """TwitPic OAuth Client API"""
    
    SIGNIN_URL        = 'https://api.twitter.com/oauth/authenticate'
    STATUS_UPDATE_URL = 'https://api.twitter.com/1/statuses/update.json'
    USER_INFO_URL     = 'https://api.twitter.com/1/account/verify_credentials.json'
    
    FORMAT = 'json'
    SERVER = 'http://api.twitpic.com'
    
    GET_URIS = {
        'media_show':       ('/2/media/show',      ('id',)),
        'faces_show':       ('/2/faces/show',      ('user')),
        'user_show':        ('/2/users/show',      ('username',)), # additional optional params
        'comments_show':    ('/2/comments/show',   ('media_id', 'page')),
        'place_show':       ('/2/place/show',      ('id',)),
        'places_user_show': ('/2/places/show',     ('user',)),
        'events_show':      ('/2/events/show',     ('user',)),
        'event_show':       ('/2/event/show',      ('id',)),
        'tags_show':        ('/2/tags/show',       ('tag',)),
    }
        
    POST_URIS = {
        'upload':           ('/2/upload',          ('message', 'media')),
        'comments_create':  ('/2/comments/create', ('message_id', 'message')),
        'faces_create':     ('/2/faces/create',    ('media_id', 'top_coord', 'left_coord')), # additional optional params
        'event_create':     ('/2/event/create',    ('name')), # additional optional params
        'event_add':        ('/2/event/add',       ('event_id', 'media_id')), # no workie!
        'tags_create':      ('/2/tags/create',     ('media_id', 'tags')),
    }
    
    PUT_URIS = {
        'faces_edit':       ('/2/faces/edit',      ('tag_id', 'top_coord', 'left_coord')),
    }
    
    DELETE_URIS = {
        'comments_delete':  ('/2/comments/delete', ('comment_id')),
        'faces_delete':     ('/2/faces/delete',    ('tag_id')),
        'event_delete':     ('/2/event/delete',    ('event_id')),
        'event_remove':     ('/2/event/remove',    ('event_id', 'media_id')),
        'tags_delete':      ('/2/tags/delete',     ('media_id', 'tag_id')),
    }
        
    def __init__(self, consumer_key=None, consumer_secret=None, 
                 service_key=None, access_token=None):
        """
        An object for interacting with the Twitpic API.
        
        The arguments listed below are generally required for most calls.
        
        Args:
          consumer_key:
            Twitter API Key [optional]
          consumer_secret:
            Twitter API Secret [optional]
          access_token:
            Authorized access_token in string format. [optional]
          service_key:
            Twitpic service key used to interact with the API. [optional]
        
        NOTE:
          The TwitPic OAuth Client does NOT support fetching 
          an access_token. Use your favorite Twitter API Client to 
          retrieve this.
        
        """
        self.server = self.SERVER
        self.consumer = oauth.OAuthConsumer(consumer_key, consumer_secret)
        self.signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()
        self.service_key = service_key        
        self.format = self.FORMAT
        
        if access_token:
            self.access_token = oauth.OAuthToken.from_string(access_token)
    
    def set_comsumer(self, consumer_key, consumer_secret):
        self.consumer = oauth.OAuthConsumer(consumer_key, consumer_secret)
    
    def set_access_token(self, access_token):
        self.access_token = oauth.OAuthToken.from_string(access_token)
    
    def set_service_key(self, service_key):
        self.service_key = service_key
    
    def _encode_multipart_formdata(self, fields=None):
        BOUNDARY = '-------tHISiStheMulTIFoRMbOUNDaRY'
        CRLF = '\r\n'
        L = []
        filedata = None
        media = fields.get('media', '')
        
        if media:
            filedata = self._get_filedata(media)
            del fields['media']
        
        if fields:
            for (key, value) in fields.items():
                L.append('--' + BOUNDARY)
                L.append('Content-Disposition: form-data; name="%s"' % str(key))
                L.append('')
                L.append(str(value))
                
        if filedata:     
            for (filename, value) in [(media, filedata)]:
                L.append('--' + BOUNDARY)
                L.append('Content-Disposition: form-data; name="media"; \
                    filename="%s"' % (str(filename),))
                L.append('Content-Type: %s' % self._get_content_type(media))
                L.append('')
                L.append(value.getvalue())
        
        L.append('--' + BOUNDARY + '--')
        L.append('')
        body = CRLF.join(L)
        content_type = 'multipart/form-data; boundary=%s' % BOUNDARY
        
        return content_type, body
    
    def _get_content_type(self, media):
        return mimetypes.guess_type(media)[0] or 'application/octet-stream'
    
    def _get_filedata(self, media):
        # Check self.image is an url, file path, or nothing.
        prog = re.compile('((https?|ftp|gopher|telnet|file|notes|ms-help):((//)|(\\\\))+[\w\d:#@%/;$()~_?\+-=\\\.&]*)')
        
        if prog.match(media):
            return StringIO.StringIO(urllib2.urlopen(media).read())
        elif os.path.exists(media):
            return StringIO.StringIO(open(media, 'rb').read())
        else:
            return None
    
    def _post_call(self, method, params, uri, required):     
        if not self.consumer:
            raise TwitPicError("Missing Twitter consumer keys")
        if not self.access_token:
            raise TwitPicError("Missing access_token")
        if not self.service_key:
            raise TwitPicError("Missing TwitPic service key")
        
        for req_param in required:
            if req_param not in params:
                raise TwitPicError('"' + req_param + '" parameter is not provided.')
        
        oauth_request = oauth.OAuthRequest.from_consumer_and_token(
            self.consumer,
            self.access_token,
            http_url=self.USER_INFO_URL
        )        
        
        # Sign our request before setting Twitpic-only parameters
        oauth_request.sign_request(self.signature_method, self.consumer, self.access_token)
        
        # Set TwitPic parameters
        oauth_request.set_parameter('key', self.service_key)
        
        for key, value in params.iteritems():
            oauth_request.set_parameter(key, value)
        
        # Build request body parameters.
        params = oauth_request.parameters
        content_type, content_body = self._encode_multipart_formdata(params)

        # Get the oauth headers.
        oauth_headers = oauth_request.to_header(realm='http://api.twitter.com/')

        # Add the headers required by TwitPic and any additional headers.
        headers = {
            'X-Verify-Credentials-Authorization': oauth_headers['Authorization'],
            'X-Auth-Service-Provider': self.USER_INFO_URL,
            'User-Agent': 'Python-TwitPic2',
            'Content-Type': content_type
        }

        # Build our url
        url = '%s%s.%s' % (self.server, uri, self.format)

        # Make the request.
        req = urllib2.Request(url, content_body, headers)

        try:
            # Get the response.
            response = urllib2.urlopen(req)
        except urllib2.HTTPError, e:
            raise TwitPicError(e)

        if self.format == 'json':
            return self.parse_json(response.read())
        elif self.format == 'xml':
            return self.parse_xml(response.read())
    
    def read(self, method, params, format=None):
        """
        Use this method for all GET URI calls.
        
        An access_token or service_key is not required for this method.
        
        Args:
          method:
            name that references which GET URI to use.
          params:
            dictionary of parameters needed for the selected method call.
          format:
            response format. default is json. options are (xml, json)
        
        NOTE:
          faces_show is actually a POST method. However, since data
          is being retrieved and not created, it seemed appropriate 
          to keep this call under the GET method calls. Tokens and keys 
          will be required for this call as well.
        
        """
        uri, required = self.GET_URIS.get(method, (None, None))
        if uri is None:
            raise TwitPicError('Unidentified Method: ' + method)
        
        if format:
            self.format = format
        
        if method == 'faces_show':
            return self._post_call(method, params, uri, required)
        
        for req_param in required:
            if req_param not in params:
                raise TwitPicError('"' + req_param + '" parameter is not provided.')
        
        # Build our GET url
        request_params = urllib.urlencode(params)
        url = '%s%s.%s?%s' % (self.server, uri, self.format, request_params)
        
        # Make the request.
        req = urllib2.Request(url)
        
        try:
            # Get the response.
            response = urllib2.urlopen(req)
        except urllib2.HTTPError, e:
            raise TwitPicError(e)
        
        if self.format == 'json':
            return self.parse_json(response.read())
        elif self.format == 'xml':
            return self.parse_xml(response.read())
        
    def create(self, method, params, format=None):
        """
        Use this method for all POST URI calls.
        
        Args:
          method:
            name that references which POST URI to use.
          params:
            dictionary of parameters needed for the selected method call.
          format:
            response format. default is json. options are (xml, json)
        
        NOTE:
          You do NOT have to pass the key param (service key). Service key
          should have been provided before calling this method.
        
        """
        if 'key' in params:
            raise TwitPicError('"key" parameter should be provided by set_service_key method or initializer method.')
        
        uri, required = self.POST_URIS.get(method, (None, None))
        
        if uri is None:
            raise TwitPicError('Unidentified Method: ' + method)
        
        if format:
            self.format = format
        
        return self._post_call(method, params, uri, required)
    
    def update(self, method, params, format=None):
        """
        Use this method for all PUT URI calls.
        
        Args:
          method:
            name that references which PUT URI to use.
          params:
            dictionary of parameters needed for the selected method call.
          format:
            response format. default is json. options are (xml, json)
        
        """
        if 'key' in params:
            raise TwitPicError('"key" parameter should be provided by set_service_key method or initializer method.')
        
        uri, required = self.PUT_URIS.get(method, (None, None))
        
        if uri is None:
            raise TwitPicError('Unidentified Method: ' + method)
        
        if format:
            self.format = format
        
        return self._post_call(method, params, uri, required)
    
    def remove(self, method, params, format=None):
        """
        Use this method for all DELETE URI calls.
        
        Args:
          method:
            name that references which DELETE URI to use.
          params:
            dictionary of parameters needed for the selected method call.
          format:
            response format. default is json. options are (xml, json)
        
        """
        if 'key' in params:
            raise TwitPicError('"key" parameter should be provided by set_service_key method or initializer method.')
        
        uri, required = self.DELETE_URIS.get(method, (None, None))
        
        if uri is None:
            raise TwitPicError('Unidentified Method: ' + method)
        
        if format:
            self.format = format
        
        return self._post_call(method, params, uri, required)
        
    def parse_xml(self, xml_response):
        try:
            dom = xml.parseString(xml_response)
            node = dom.firstChild
            if node.nodeName == 'errors':
                return node.firstChild.nodeValue
            else:
                return dom
        except ExpatError, e:
            raise TwitPicError('XML Parsing Error: ' + e)
    
    def parse_json(self, json_response):
        try:
            result = json.loads(json_response)
            if result.has_key('errors'):
                return result['errors']['code']
            else:
                return result
        except ValueError, e:
            raise TwitPicError('JSON Parsing Error: ' + e)

if __name__ == '__main__':
    from optparse import OptionParser
    optPsr = OptionParser("usage: %prog -k CONSUMER_KEY -s CONSUMER_SECRET -a ACCESS_TOKEN -t SERVICE_KEY -m TWEET -f FILE")
    optPsr.add_option('-k', '--consumer_key', type='string', help='Twitter consumer API key')
    optPsr.add_option('-s', '--consumer_secret', type='string', help='Twitter consumer API secret')
    optPsr.add_option('-a', '--access_token', type='string', help='Twitter Access Token')
    optPsr.add_option('-t', '--service_key', type='string', help='Twitpic API key')
    optPsr.add_option('-m', '--message', type='string', help='The tweet that belongs to the image.')
    optPsr.add_option('-f', '--file', type='string', help='The file upload data.')
    (opts, args) = optPsr.parse_args()
    
    if not opts.consumer_key:
        optPsr.error("Missing CONSUMER_KEY")
    
    if not opts.consumer_secret:
        optPsr.error("Missing CONSUMER_SECRET")
    
    if not opts.access_token:
        optPsr.error("Missing ACCESS_TOKEN")
    
    if not opts.service_key:
        optPsr.error("Missing SERVICE_KEY")
    
    if not opts.message:
        optPsr.error("Missing TWEET")
    
    if not opts.file:
        optPsr.error("Missing FILE")
    
    twitpic = TwitPicOAuthClient(
        consumer_key = opts.consumer_key,
        consumer_secret = opts.consumer_secret,
        access_token = opts.access_token,
        service_key = opts.service_key,
    )
    
    response = twitpic.create('upload', {'media': opts.file, 'message': opts.message })
    print response
