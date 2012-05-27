import webapp2
import functools
import base64
import re
import random
import handlers_base
import logging

from google.appengine.api import urlfetch

class ProxyHandler(webapp2.RequestHandler):
  def get(self):
    fetchdata = urlfetch.fetch(self.request.get('url'))
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.headers.add_header("Expires", "Thu, 01 Dec 1994 16:00:00 GMT")
    self.response.out.write(fetchdata.content)
