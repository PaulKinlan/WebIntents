import webapp2
from webapp2 import Route
from webapp2_extras import routes

import handlers_base
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


exampleRoutes = [ Route('/<:.*>', examples.handlers.PageHandler, 'examples')]
demoRoutes = [
      Route('/mememator/proxy', demos.mememator.handlers.ProxyHandler, 'demos'),
      Route('/mememator/<:.*>', demos.mememator.handlers.PageHandler, 'demos'),
      Route('/imagestudio/<:.*>', demos.imagestudio.handlers.PageHandler, 'demos'),
      Route('/twitpic/proxy', demos.twitpic.handlers.ProxyHandler, 'demos'),
      Route('/twitpic/upload', demos.twitpic.handlers.UploadHandler, 'demos'),
      Route('/twitpic/<:.*>', demos.twitpic.handlers.PageHandler, 'demos'),
      Route('/shortener/shorten', demos.shortener.handlers.ShortenHandler, 'demos'),
      Route('/shortener/<:.*>', demos.shortener.handlers.PageHandler, 'demos'),
      Route('/instapaper/add', demos.instapaper.handlers.AddHandler, 'demos'),
      Route('/instapaper/<:.*>', demos.instapaper.handlers.PageHandler, 'demos'),
      Route('/imgur/save', demos.imgur.handlers.SaveHandler, 'demos'),
      Route('/imgur/<:.*>', demos.imgur.handlers.PageHandler, 'demos'),
      Route('/<:.*>', demos.handlers.PageHandler, 'demos')
]

app = webapp2.WSGIApplication([
    routes.DomainRoute('webintents-org.appspot.com', [
      Route('/<:.*>', webintents.handlers.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('examples.webintents-org.appspot.com', exampleRoutes),
    routes.DomainRoute('examples.webintents.org', exampleRoutes),
    routes.DomainRoute('demos.webintents-org.appspot.com', demoRoutes ),
    routes.DomainRoute('demos.webintents.org', demoRoutes),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', registry.handlers.PageHandler, 'registry')
    ]),
    routes.DomainRoute('widgets.webintents-org.appspot.com', [
      Route('/<:.*>', widgets.handlers.PageHandler, 'widgets')
    ])
  ])
