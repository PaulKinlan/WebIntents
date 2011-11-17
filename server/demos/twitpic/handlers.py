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

class UploadHandler(webapp2.RequestHandler):
  def post(self):
    '''
    Saves the image to here if not logged in, uploads to twitpic if you are
    '''
    twitpic = twitpic2.TwitPicOAuthClient(
      consumer_key = CONSUMER_KEY,
      consumer_secret = CONSUMER_SECRET,
      access_token = "oauth_token=%s&oauth_token_secret=%s"  % (USER_TOKEN, USER_TOKEN_SECRET),
      service_key = SERVICE_KEY
    )

class ProxyHandler(webapp2.RequestHandler):
  def get(self):
    fetchdata = urlfetch.fetch(self.request.get('url'))
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.headers.add_header("Expires", "Thu, 01 Dec 1994 16:00:00 GMT")
    self.response.out.write(fetchdata.content)
    
