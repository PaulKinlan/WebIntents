import webapp2
import jinja2
import os
from google.appengine.api import urlfetch
from google.appengine.api import taskqueue
from google.appengine.ext import db
import handlers_base
import intentparser
import logging

class IndexHistory(db.Model):
  created_on = db.DateTimeProperty(auto_now = False, auto_now_add = True)
  content = db.TextProperty()
  status_code = db.StringProperty()
  headers = db.TextProperty()
  final_url = db.StringProperty()

class Intent(db.Model):
  href = db.StringProperty(indexed = False)
  title = db.StringProperty(indexed = False)
  action = db.StringProperty()
  disposition = db.StringProperty()
  icon = db.StringProperty()
  type_major = db.StringProperty()
  type_minor = db.StringProperty()
  created_on = db.DateTimeProperty(auto_now = False, auto_now_add = True)
  updated_on = db.DateTimeProperty(auto_now = True, auto_now_add = True)
  enabled = db.BooleanProperty(default = True)
  rank = db.FloatProperty(default = 0.0) # Some arbitrary rank.
  scan = db.ReferenceProperty(IndexHistory) # A reference to the scan

class PageIntent(db.Model):
  """
  A page will point to an intent handler, use this to keep track.
  """
  url = db.StringProperty()
  target_url = db.StringProperty()
  intent = db.ReferenceProperty()

class IndexerHandler(handlers_base.PageHandler):
  def post(self):
    '''
      Creates a new task to go off and fetch the data from the page.
    '''
    url = self.request.get("url")
    file = "indexer.html"
    
    taskqueue.add(url = '/tasks/crawl', params = { "url": url })

    self.render_file(file, "registry")

class CrawlerTask(webapp2.RequestHandler):
  '''
    The crawler will go off, grab a page from a server and store it for
    inspection later.  We will not parse it here.
  '''
  def post(self):
    url = self.request.get("url")
    data = urlfetch.fetch(url, deadline = 10)
    
    history = IndexHistory()
    history.status_code = str(data.status_code)
    history.content = data.content
    history.headers = str(data.headers)
    history.final_url = data.final_url or url
    history.put()

    taskqueue.add(url ='/tasks/parse-intent', params = { "key" : history.key() })

class ParseIntentTask(webapp2.RequestHandler):
  '''
    Parses the intent out of an a document that was fetched from the web
  '''
  def post(self):
    key = self.request.get('key')
    parser = intentparser.IntentParser()

    history = IndexHistory.get(key)
    
    intents = parser.parse(history.content, history.final_url)
    for intent in intents:
      new_intent = Intent(**intent)
      new_intent.scan = history
      new_intent.put()

      page_intent = PageIntent()
      page_intent.url = history.final_url
      page_intent.target_url = new_intent.href
      page_intent.intent = new_intent;
      page_intent.put()

class RegistryHandler(webapp2.RequestHandler):
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
      self.response.out.write(template.render({intents : results}))
    else:
      self.error(404)
