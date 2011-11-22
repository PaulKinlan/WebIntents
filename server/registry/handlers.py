import webapp2
import re
import jinja2
import os
from google.appengine.api import urlfetch
from google.appengine.api import taskqueue
from google.appengine.ext import db
import handlers_base
import logging

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
  enabled = db.BooleanProperty() # The intent may no longer exist at the URL where it was defined, if it doesn't remove it
  rank = db.FloatProperty(default = 0.0) # Some arbitrary rank.

class IndexHistory(db.Model):
  created_on = db.DateTimeProperty(auto_now = False, auto_now_add = True)
  content = db.TextProperty()
  status_code = db.StringProperty()
  headers = db.TextProperty()
  final_url = db.StringProperty()

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
    data = urlfetch.fetch(url)
    
    history = IndexHistory()
    history.status_code = str(data.status_code)
    history.content = data.content
    history.headers = str(data.headers)
    history.final_url = data.final_url
    history.put()

    taskqueue.add(url ='/tasks/parse-intent', params = { "key" : history.key() })

class IntentParser():
  intent_regex = "<intent .*?/>"
  attribute_value_regex = "['\"]?([^>]+)['\"]?"
  type_regex = "type=" + attribute_value_regex
  icon_regex = "icon=" + attribute_value_regex
  title_regex = "title=" + attribute_value_regex
  disposition_regex = "disposition=" + attribute_value_regex
  href_regex = "href=" + attribute_value_regex
 
  def _get_value(self, regex, text):
    match = re.search(regex, text, flags = re.I | re.M)
    if match is None:
      return None
    else:
      return match.groups(0)

    return None

  def _parse_type(self, text):
    return _get_value(IntentParser.type_regex, text)

  def _parse_action(self, text):
    return _get_value(IntentParser.action_regex, text)

  def _parse_icon(self, text):
    return _get_value(IntentParser.icon_regex, text)

  def _parse_title(self, text):
    return _get_value(IntentParser.title_regex, text)

  def _parse_href(self, text):
    return _get_value(IntentParser.href_regex, text)

  def _parse_disposition(self, text):
    return _get_value(disposition_regex, text)

  def parse(self, text):
    intents = []

    for match in re.finditer(IntentParser.intent_regex, text, flags = re.I | re.M):
      text = match.groups(0)
      logging.info(text)
      type = self._parse_type(text)
      if type:
        type_major, type_minor = type.split("/")

      intent = {
        "title": self._parse_title(text),
        "icon": self._parse_icon(text),
        "action": self._parse_action(text),
        "href": self._parse_href(text),
        "type_major": type_major,
        "type_minor": type_minor,
        "disposition": self._parse_disposition(text)
      }
      intents.push(intent)

    return intents

class ParseIntentTask(webapp2.RequestHandler):
  '''
    Parses the intent out of an a document that was fetched from the web
  '''
  def post(self):
    key = self.request.get('key')
    parser = IntentParser()

    history = IndexHistory.get(key)
    
    intents = parser.parse(history.content)
    logging.info(intents)      
    for intent in intents:
      new_intent = Intent(**intent)
      new_intent.put()

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
      self.response.out.write(template.render({intents : results}))
    else:
      self.error(404)
