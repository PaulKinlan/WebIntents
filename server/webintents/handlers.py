import webapp2
import jinja2
import os
from google.appengine.api import urlfetch
import handlers

class PageHandler(handlers.PageHandler):
  """
    The main page handler for the server
  """
