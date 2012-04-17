import webapp2
import functools
import base64
import re
import random
import handlers_base
import logging

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

class MemematorImage(db.Model):
  created_on = db.DateTimeProperty(auto_now_add = True)
  updated_on = db.DateTimeProperty(auto_now = True)
  text_top = db.StringProperty(default = "")
  text_bottom = db.StringProperty(default = "")
  image = db.BlobProperty()
  permission_key = db.StringProperty()

class ImageHandler(handlers_base.PageHandler):
  # Homage to http://stackoverflow.com/questions/1590965/uploading-canvas-image-data-to-the-server
  data_url_pattern = re.compile('data:image/(png|jpeg);base64,(.*)$')

  def decode_image(self, image_data):
    image = self.data_url_pattern.match(image_data).group(2)
    if image is not None and len(image) > 0:
      return db.Blob(base64.b64decode(image))

  @run_as(ns = 'mememator')
  def get(self, file):
    id, extension = handlers_base.parse_filename(file)

    image_model = MemematorImage.get_by_id(int(id))

    content_type = handlers_base.get_content_type(extension)
    self.response.headers['Content-Type'] = content_type 
    self.response.headers['Cache-Control'] = 'max-age=3600, public, must-revalidate'

    if content_type == "text/html":
      url = "/image/%s.png" % (id)
      self.render_file("view.html", self.request.route.name, {"url": url, "title": id, "text_top": image_model.text_top, "text_bottom": image_model.text_bottom })
    else:
      self.response.out.write(image_model.image)

  @run_as(ns = 'mememator')
  def put(self, id):
    """
    Update an existing image.
    """
    image_data = self.request.get('image')
    permission_key = self.request.get("permissionKey")
    text_top = self.request.get("textTop")
    text_bottom = self.request.get("textBottom")

    image_model = MemematorImage.get_by_id(int(id))

    if image_model.permission_key != permission_key:
      self.response.set_status(401)
      return

    image_model.image = self.decode_image(image_data)
    image_model.text_top = text_top
    image_model.text_bottom = text_bottom
    image_model.put()

    self.response.headers['Content-type'] = 'application/json'
    self.response.out.write({})

  @run_as(ns = 'mememator')
  def post(self):
    """
    Create a new image.
    """
    image_data = self.request.get('image')
    permission_key = ''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for x in range(36))  

    image_model = MemematorImage()
    image_model.image = self.decode_image(image_data)
    image_model.permission_key = permission_key
    image_model.put()

    self.response.headers['Content-type'] = 'application/json'
    self.response.out.write('{ "id" : "%s", "permissionKey": "%s"  }' % (image_model.key().id(), permission_key))

class ProxyHandler(webapp2.RequestHandler):
  def get(self):
    fetchdata = urlfetch.fetch(self.request.get('url'))
    self.response.headers['Content-type'] = fetchdata.headers['Content-type']
    self.response.set_status(fetchdata.status_code)
    self.response.headers.add_header("Expires", "Thu, 01 Dec 1994 16:00:00 GMT")
    self.response.out.write(fetchdata.content)
