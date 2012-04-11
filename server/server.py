import webapp2
from webapp2 import Route
from webapp2_extras import routes

import handlers_base
import registry.handlers
import widgets.handlers
import demos.mememator.handlers
import demos.shortener.handlers
import demos.instapaper.handlers
import demos.imgur.handlers
import demos.inspirationmator.handlers

exampleRoutes = [ Route('/<:.*>', handlers_base.PageHandler, 'examples')]

app = webapp2.WSGIApplication([
    Route('/tasks/crawl', registry.handlers.CrawlerTask),
    Route('/tasks/parse-intent', registry.handlers.ParseIntentTask),
    routes.DomainRoute('webintents-org.appspot.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('webintents.org', [
      Route('/<:.*>', handlers_base.PageHandler, 'webintents')
    ]),
    routes.DomainRoute('examples.webintents.org', exampleRoutes),
    routes.DomainRoute('registry.webintents-org.appspot.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'registry')
    ]),
    routes.DomainRoute('widgets.webintents-org.appspot.com', [
      Route('/<:.*>', widgets.handlers.PageHandler, 'widgets')
    ]),
    routes.DomainRoute('registry.webintents.org', [
      Route('/indexer.html', registry.handlers.IndexerHandler, 'registry'),
      Route('/suggestions.html', registry.handlers.SuggestionsHandler, 'registry'),
      Route('/<:.*>', handlers_base.PageHandler, 'registry')
    ]),
    routes.DomainRoute('www.imagemator.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/imagestudio'),
    ]),
    routes.DomainRoute('www.comicmator.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/comicmator'),
    ]),
    routes.DomainRoute('www.quicksnapr.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/profilephoto'),
    ]),
    routes.DomainRoute('www.binhexdec.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/binhexdec'),
    ]),
    routes.DomainRoute('www.cloudfilepicker.com', [
      Route('/<:.*>', handlers_base.PageHandler, 'demos/cloudfilepicker'),
    ]),
    routes.DomainRoute('www.mememator.com', [
      Route('/proxy', demos.mememator.handlers.ProxyHandler, 'demos/mememator'),
      Route('/image', demos.mememator.handlers.ImageHandler, 'demos/mememator'),
      Route('/image/<:.*>', demos.mememator.handlers.ImageHandler, 'demos/mememator'),
      Route('/view.html',   demos.mememator.handlers.ViewHandler, 'demos/mememator'),
      Route('/<:.*>', handlers_base.PageHandler, 'demos/mememator'),
    ]),
    routes.DomainRoute('www.inspirationmator.com', [
      Route('/proxy', demos.inspirationmator.handlers.ProxyHandler, 'demos/inspirationmator'),
      Route('/image', demos.inspirationmator.handlers.ImageHandler, 'demos/inspirationmator'),
      Route('/image/<:.*>', demos.inspirationmator.handlers.ImageHandler, 'demos/inspirationmator'),
      Route('/view.html',   demos.inspirationmator.handlers.ViewHandler, 'demos/inspirationmator'),
      Route('/<:.*>', handlers_base.PageHandler, 'demos/inspirationmator'),
    ])
  ])
