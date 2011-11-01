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

app = webapp2.WSGIApplication([
    routes.DomainRoute('webintents-org.appspot.com', [
      Route('/<:.*>', webintents.handlers.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('examples.webintents-org.appspot.com', [
      Route('/<:.*>', examples.handlers.PageHandler, 'examples')
    ]),
    routes.DomainRoute('demos.webintents-org.appspot.com', [
      Route('/mememator/<:.*>', demos.mememator.handlers.PageHandler, 'mememator'),
      Route('/imagestudio/proxy', demos.imagestudio.handlers.ProxyHandler, 'imagestudio-proxy'),
      Route('/imagestudio/<:.*>', demos.imagestudio.handlers.PageHandler, 'imagestudio'),
      Route('/<:.*>', demos.handlers.PageHandler, 'demos')
    ]),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', registry.handlers.PageHandler, 'registry')
    ]),
    routes.DomainRoute('widgets.webintents-org.appspot.com', [
      Route('/<:.*>', widgets.handlers.PageHandler, 'widgets')
    ])
  ])


