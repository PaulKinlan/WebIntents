import webapp2
from webapp2 import Route
from webapp2_extras import routes

import examples.handlers
import demos.handlers
import registry.handlers
import webintents.handlers
import widgets.handlers
import demos.mememator.handlers
import demos.imagestudio.handlers
import demos.twitpic.handlers
import demos.shortener.handlers
import demos.instapaper.handlers
import demos.imgur.handlers

app = webapp2.WSGIApplication([
    routes.DomainRoute('webintents-org.appspot.com', [
      Route('/<:.*>', webintents.handlers.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('examples.webintents-org.appspot.com', [
      Route('/<:.*>', examples.handlers.PageHandler, 'examples')
    ]),
    routes.DomainRoute('demos.webintents-org.appspot.com', [
      Route('/mememator/proxy', demos.mememator.handlers.ProxyHandler, 'mememator-proxy'),
      Route('/mememator/<:.*>', demos.mememator.handlers.PageHandler, 'mememator'),
      Route('/imagestudio/<:.*>', demos.imagestudio.handlers.PageHandler, 'imagestudio'),
      Route('/twitpic/proxy', demos.twitpic.handlers.ProxyHandler, 'twitpic-proxy'),
      Route('/twitpic/upload', demos.twitpic.handlers.UploadHandler, 'twitpic-proxy'),
      Route('/twitpic/<:.*>', demos.twitpic.handlers.PageHandler, 'twitpic'),
      Route('/shortener/shorten', demos.shortener.handlers.ShortenHandler, 'shortener-proxy'),
      Route('/shortener/<:.*>', demos.shortener.handlers.PageHandler, 'shortener'),
      Route('/instapaper/add', demos.instapaper.handlers.AddHandler, 'instapaper-proxy'),
      Route('/instapaper/<:.*>', demos.instapaper.handlers.PageHandler, 'instapaper'),
      Route('/imgur/save', demos.imgur.handlers.SaveHandler, 'imgur-proxy'),
      Route('/imgur/<:.*>', demos.imgur.handlers.PageHandler, 'imgur'),
      Route('/<:.*>', demos.handlers.PageHandler, 'demos')
    ]),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', registry.handlers.PageHandler, 'registry')
    ]),
    routes.DomainRoute('widgets.webintents-org.appspot.com', [
      Route('/<:.*>', widgets.handlers.PageHandler, 'widgets')
    ])
  ])


