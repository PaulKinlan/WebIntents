import webapp2
import jinja2
import os
import json
from google.appengine.api import urlfetch
import logging
import urllib

jinja_environment = jinja2.Environment(
        loader=jinja2.FileSystemLoader(
          os.path.dirname(__file__)))

file_types = {
  '.js' : 'application/javascript',
  '.html' : 'text/html',
  '.css' : 'text/css'
}  

class PageHandler(webapp2.RequestHandler):
  def get(self, file):
    self.response.headers['X-Content-Security-Policy'] = "allow 'self'; img-src *"
    
    if file is None or file == "":
      file = "index.html"

    name, extension  = os.path.splitext(file)

    content_type = file_types.get(extension, "text/html") 
    self.response.headers['Content-Type'] = content_type

    # test if the file exists in the static
    path = os.path.join(os.path.dirname(__file__), "static", file)
    if os.path.exists(path):
      f = open(path, "r")
      self.response.out.write(f.read())
      return
    
    path = os.path.join(os.path.dirname(__file__), "pages", file)
    if os.path.exists(path):
      template = jinja_environment.get_template(os.path.join("pages", file))
      self.response.out.write(template.render())
    else:
      self.error(404)

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
    
