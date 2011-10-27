import webapp2
import jinja2
import os
import logging

jinja_environment = jinja2.Environment(
        loader=jinja2.FileSystemLoader(
          os.path.dirname(__file__)))

class PageHandler(webapp2.RequestHandler):
  def get(self, file):
    if file is None or file == "":
      file = "index.html"
    # test if the file exists
    path = os.path.join(os.path.dirname(__file__), "pages", file)
    if os.path.exists(path):
      template = jinja_environment.get_template(os.path.join("pages", file))
      self.response.out.write(template.render())
    else:
      self.error(404)
