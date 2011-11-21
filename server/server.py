import webapp2
from webapp2 import Route
from webapp2_extras import routes

import handlers_base
import registry.handlers
import widgets.handlers
import demos.mememator.handlers
import demos.twitpic.handlers
import demos.shortener.handlers
import demos.instapaper.handlers
import demos.imgur.handlers

import sys
#for attr in ('stdin', 'stdout', 'stderr'):
#  setattr(sys, attr, getattr(sys, '__%s__' % attr))


exampleRoutes = [ Route('/<:.*>', handlers_base.PageHandler, 'examples')]
demoRoutes = [
      Route('/mememator/proxy', demos.mememator.handlers.ProxyHandler, 'demos/mememator'),
      Route('/mememator/<:.*>', handlers_base.PageHandler, 'demos/mememator'),
      Route('/imagestudio/<:.*>', handlers_base.PageHandler, 'demos/imagestudio'),
      Route('/twitpic/proxy', demos.twitpic.handlers.ProxyHandler, 'demos/twitpic'),
      Route('/twitpic/upload', demos.twitpic.handlers.UploadHandler, 'demos/twitpic'),
      Route('/twitpic/<:.*>', handlers_base.PageHandler, 'demos/twitpic'),
      Route('/shortener/shorten', demos.shortener.handlers.ShortenHandler, 'demos/shortener'),
      Route('/shortener/<:.*>', handlers_base.PageHandler, 'demos/shortener'),
      Route('/instapaper/add', demos.instapaper.handlers.AddHandler, 'demos/instapaper'),
      Route('/instapaper/<:.*>', handlers_base.PageHandler, 'demos/instapaper'),
      Route('/imgur/save', demos.imgur.handlers.SaveHandler, 'demos/imgur'),
      Route('/imgur/<:.*>', handlers_base.PageHandler, 'demos/imgur'),
      Route('/<:.*>', handlers_base.PageHandler, 'demos')
]

app = webapp2.WSGIApplication([
    routes.DomainRoute('webintents-org.appspot.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('webintents.org', [
      Route('/<:.*>', handlers_base.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('examples.webintents-org.appspot.com', exampleRoutes),
    routes.DomainRoute('examples.webintents.org', exampleRoutes),
    routes.DomainRoute('demos.webintents-org.appspot.com', demoRoutes ),
    routes.DomainRoute('demos.webintents.org', demoRoutes),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'registry')
    ]),
    routes.DomainRoute('widgets.webintents-org.appspot.com', [
      Route('/<:.*>', widgets.handlers.PageHandler, 'widgets')
    ]),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'registry')
    ]),
    routes.DomainRoute('registry.webintents.org', [
      Route('/<:.*>', handlers_base.PageHandler, 'registry')
    ]),
    routes.DomainRoute('www.imagemator.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/imagestudio'),
    ]),
    routes.DomainRoute('www.comicmator.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/comicmator'),
    ]),
    routes.DomainRoute('www.mememator.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/mememator'),
    ])
  ])
