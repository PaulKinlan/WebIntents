# Copyright 2011 Google Inc. All Rights Reserved.

'''One-line documentation for Registry module.

A detailed description of Registry.
'''

__author__ = 'tpayne@google.com (Tony Payne)'

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
import data
import os

class Registry(webapp.RequestHandler):
  def get(self):
    q = data.Intent.all()
    results = q.fetch(100)
    template_data = {}
    template_data['intents'] = results
    path = os.path.join(os.path.dirname(__file__), 'registry.html')
    self.response.out.write(template.render(path, template_data))

  def post(self):
    data.Intent.addIntentProvider(
        self.request.get('action'),
        self.request.get_all('mime_type'),
        self.request.get('href'))
    self.redirect('/registry/')

class Intent(webapp.RequestHandler):
  def get(self):
    intent = data.Intent.get_by_key_name(self.request.get('intent'))
    q = data.QualifiedIntent.all()
    results = q.ancestor(intent)
    template_data = {
        'mime_types': results,
        'intent': intent
    }
    path = os.path.join(os.path.dirname(__file__), 'intent.html')
    self.response.out.write(template.render(path, template_data))

class Providers(webapp.RequestHandler):
  def get(self):
    intent = data.Intent.get_by_key_name(self.request.get('intent'))
    qualified_intent = data.QualifiedIntent.get_by_key_name(
        self.request.get('mime_type'), parent=intent)
    template_data = {
        'intent': intent,
        'mime_type': qualified_intent }
    path = os.path.join(os.path.dirname(__file__), 'providers.html')
    self.response.out.write(template.render(path, template_data))


prefix = '/registry'
application = webapp.WSGIApplication([('%s/' % prefix, Registry),
                                      ('%s/intent' % prefix, Intent),
                                      ('%s/providers' % prefix, Providers)])

def main():
  run_wsgi_app(application)

if __name__ == '__main__':
  main()
