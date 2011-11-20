import webapp2
import jinja2
import os
from google.appengine.api import urlfetch

import handlers

class PageHandler(handlers.PageHandler):
  """
  The handler for the Mememator app 
  """

class ProxyHandler(webapp2.RequestHandler):
  def get(self):
    fetchdata = urlfetch.fetch(self.request.get('url'))
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.headers.add_header("Expires", "Thu, 01 Dec 1994 16:00:00 GMT")
    self.response.out.write(fetchdata.content)
    
