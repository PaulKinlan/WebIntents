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

exampleRoutes = [ Route('/<:.*>', handlers_base.PageHandler, 'examples')]
demoRoutes = [
      Route('/mememator/proxy', demos.mememator.handlers.ProxyHandler, 'demos/mememator'),
      Route('/mememator/<:.*>', handlers_base.PageHandler, 'demos/mememator'),
      Route('/imagestudio/<:.*>', handlers_base.PageHandler, 'demos/imagestudio'),
      Route('/shortener/shorten', demos.shortener.handlers.ShortenHandler, 'demos/shortener'),
      Route('/shortener/<:.*>', handlers_base.PageHandler, 'demos/shortener'),
      Route('/instapaper/add', demos.instapaper.handlers.AddHandler, 'demos/instapaper'),
      Route('/instapaper/<:.*>', handlers_base.PageHandler, 'demos/instapaper'),
      Route('/imgur/save', demos.imgur.handlers.SaveHandler, 'demos/imgur'),
      Route('/imgur/<:.*>', handlers_base.PageHandler, 'demos/imgur'),
      Route('/profilephoto/<:.*>', handlers_base.PageHandler, 'demos/profilephoto'),
      Route('/<:.*>', handlers_base.PageHandler, 'demos')
]

app = webapp2.WSGIApplication([
    Route('/tasks/crawl', registry.handlers.CrawlerTask),
    Route('/tasks/parse-intent', registry.handlers.ParseIntentTask),
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
      Route('/<:.*>', handlers_base.PageHandler, 'demos/mememator'),
    ]),
    routes.DomainRoute('www.inspirationmator.com', [
      Route('/proxy', demos.mememator.handlers.ProxyHandler, 'demos/inspirationmator'),
      Route('/<:.*>', handlers_base.PageHandler, 'demos/inspirationmator'),
    ])
  ])
