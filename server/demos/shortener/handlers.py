import webapp2
import jinja2
import os
from google.appengine.api import urlfetch


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

class ShortenHandler(webapp2.RequestHandler):
  def post(self):
    url = "https://www.googleapis.com/urlshortener/v1/url"
    headers = { "Content-Type": "application/json" }
    payload = {"longUrl": self.request.get(url) }
    fetchdata = urlfetch.fetch(url, method = "POST", headers = headers)
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.out.write(fetchdata.content)
    
