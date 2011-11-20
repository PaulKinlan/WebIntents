import webapp2
import jinja2
import os
from google.appengine.api import urlfetch
import handlers

class PageHandler(handlers.PageHandler):
  """
  The handler for the Imgur app 
  """

class SaveHandler(webapp2.RequestHandler):
  def post(self):
    url = "http://api.imgur.com/2/upload.json"
    payload = { 
        "key": "41bd72340ae809a19c392d88028522a4",  
        "image": "%s" % self.request.body, 
        "type": "%s" % self.request.get("type") }
    fetchdata = urlfetch.fetch(url, method = "POST", payload = urllib.urlencode(payload) )
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    logging.info(fetchdata.content)
    self.response.out.write(fetchdata.content)
    
