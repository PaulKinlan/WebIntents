import webapp2
import functools
import base64
import re

from google.appengine.api import urlfetch
from google.appengine.api import namespace_manager
from google.appengine.ext import db
from google.appengine.ext.db.metadata import Namespace

def run_as(ns = ""):
  """Decorator that ensures that restore the original namespace after the function has 
     been executed in appengine."""
  def generate(func):
    @functools.wraps(func)
    def decorated_func(self, *args, **kwargs):
      namespace = namespace_manager.get_namespace()
      
      try:
        namespace_manager.set_namespace(ns)
        res = func(self, *args, **kwargs)
      finally:
        namespace_manager.set_namespace(namespace)
      
      return res
    return decorated_func
  return generate

class Image(db.Model):
  created_on = db.DateTimeProperty(auto_now = True)
  image = db.BlobProperty()

class ImageHandler(webapp2.RequestHandler):
  # Homage to http://stackoverflow.com/questions/1590965/uploading-canvas-image-data-to-the-server
  data_url_pattern = re.compile('data:image/(png|jpeg);base64,(.*)$')

  def decode_image(self, image_data):
    image = self.data_url_pattern.match(image_data).group(2)
    if image is not None and len(image) > 0:
      return db.Blob(base64.b64decode(image))

  @run_as(ns = 'mememator')
  def get(self, id):
    image_model = Image.get_by_id(id)
    
    self.response.header['Content-type'] = 'image/png'
    self.response.out.write(image_model.image)

  @run_as(ns = 'mememator')
  def put(self, id):
    image_data = self.request.get('image')
    
    image_model = Image.get_by_id(id)
    image_model.image = self.decode_image(image_data)
    image_model.put()
    
    self.response.header['Content-type'] = 'image/png'
    self.response.out.write(image_model.image)

  @run_as(ns = 'mememator')
  def post(self):
    image_data = self.request.get('image')

    image_model = Image()
    image_model.image = self.decodeImage(image_data)
    image_model.put()

    self.response.header['Content-type'] = 'application/json'
    self.response.out.write('{ id: "%s" }' % (image_model.key().id()))

class ProxyHandler(webapp2.RequestHandler):
  def get(self):
    fetchdata = urlfetch.fetch(self.request.get('url'))
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.headers.add_header("Expires", "Thu, 01 Dec 1994 16:00:00 GMT")
    self.response.out.write(fetchdata.content)
