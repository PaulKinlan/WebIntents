# Copyright 2011 Google Inc. All Rights Reserved.

__author__ = 'tpayne@google.com (Tony Payne)'


from google.appengine.ext import db
from google.appengine.api import users

class Intent(db.Model):
  # key is the action URL
  action = db.StringProperty(required = True)

  def addProvider(self, mime_types, href):
    provider = Provider.get_or_insert(key_name=href, href=href, parent=self)
    for mime_type in mime_types:
      qualified_intent = QualifiedIntent.get_or_insert(key_name=mime_type,
                                                       mime_type=mime_type,
                                                       parent=self)
      IntentProvider(intent=qualified_intent, provider=provider,
                     parent=self).put()

  @staticmethod
  def addIntentProvider(action, mime_types, href):
    intent = Intent.get_or_insert(key_name=action, action=action)
    intent.addProvider(mime_types, href)

class QualifiedIntent(db.Model):
  # key is the mime type
  mime_type = db.StringProperty(required = True)

class Provider(db.Model):
  # key is the href
  href = db.StringProperty(required = True)

class IntentProvider(db.Model):
  provider = db.ReferenceProperty(Provider, required=True,
                                  collection_name='intents')
  intent = db.ReferenceProperty(QualifiedIntent, required=True,
                                collection_name='providers')
