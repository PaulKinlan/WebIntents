import webapp2
import jinja2
import os
from google.appengine.api import urlfetch
import handlers_base

class PageHandler(handlers_base.PageHandler):
  """
    The main page handler for the server
  """
