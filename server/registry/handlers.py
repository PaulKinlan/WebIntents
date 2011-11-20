import webapp2
import jinja2
import os
from google.appengine.api import urlfetch
from google.appengine.ext import db



jinja_environment = jinja2.Environment(
        loader=jinja2.FileSystemLoader(
          os.path.dirname(__file__)))

file_types = {
  '.js' : 'application/javascript',
  '.html' : 'text/html',
  '.css' : 'text/css'
} 

class Intent(db.Model):
  href = db.StringProperty(indexed = False)
  title = db.StringProperty(indexed = False)
  action = db.StringProperty()
  type_major = db.StringProperty()
  type_minor = db.StringProperty()
  created_on = db.DateTimeProperty(auto_now = False, auto_now_add = True)
  updated_on = db.DateTimeProperty(auto_now = True, auto_now_add = True)
  enabled = db.BooleanProperty() # The intent may no longer exist at the URL where it was defined, if it doesn't remove it
  rank = db.FloatProperty(default = 0.0) # Some arbitrary rank.

class IndexHistory(db.Model):
  intent = db.ReferenceProperty(Intent)
  created_on = db.DateTimeProperty(auto_now = False, auto_now_add = True)
  status = db.TextProperty()

class PageHandler(webapp2.RequestHandler):
  def get(self, file):
    self.response.headers['X-Content-Security-Policy'] = "allow 'self'; img-src *; script-src www.google-analytics.com apis.google.com;"
    
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


class IndexerHandler(PageHandler):
  def post(self):
    '''
      Creates a new task to go off and fetch the data from the page.
    '''
    url = self.request.get("url")
    file = "indexer.html"
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

class RegisteryHandler(webapp2.RequestHandler):
  def get(self):
    '''
      Gets a list of intents that can handle this
    '''
    alt = self.response.get("alt", default_value = "html")
    action = self.response.get("action")
    type = self.response.get("type")
    type_major, type_minor = type.split("/")

    query = db.Query(Intent).filter("action =", action)

    if type_major:
      query.filter("type_major =", type_major) 
    if type_minor is not None and type_minor != "*":
      query.filter("type_minor =", type_minor)
    
    query.order("-rank")

    results = query.fetch(5)
    
    path = os.path.join(os.path.dirname(__file__), "results", "results.%s" % alt)
    if os.path.exists(path):
      template = jinja_environment.get_template(os.path.join("results", "results.%s" % alt))
      self.response.out.write(template.render({intents = results}))
    else:
      self.error(404)

