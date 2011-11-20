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
  '.css' : 'text/css',
  '.ico' : 'image/x-icon',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.txt' : 'text/plain'
} 

class PageHandler(webapp2.RequestHandler):
  def render_file(self, file, domain):
    self.response.headers['X-Content-Security-Policy'] = "allow 'self'; img-src *; script-src www.google-analytics.com apis.google.com;"
    request_path = self.request.path 

    if file is None or file == "":
      file = "index.html"

    name, extension  = os.path.splitext(file)

    content_type = file_types.get(extension)
    # Only display known file types
    if content_type is None and extension is not None:
      self.error(404)
      return

    self.response.headers['Content-Type'] = content_type

    # test if the file exists in the static
    path = os.path.join(os.path.dirname(__file__), domain,  request_path , "static", file)
    if os.path.exists(path):
      f = open(path, "r")
      self.response.out.write(f.read())
      return
    
    path = os.path.join(os.path.dirname(__file__), domain, request_path,  "pages", file)
    if os.path.exists(path):
      template = jinja_environment.get_template(path)
      self.response.out.write(template.render())
    else:
      self.error(404)

  def get(self, file):
    self.render_file(file, self.route.name)
