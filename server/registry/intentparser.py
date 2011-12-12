import logging
import urlparse
import re

class IntentParser():
  page_title_regex = "<title>(.*?)</title>"
  intent_regex = "<intent (.*?)/>"
  attribute_value_regex = "['\"]?([^>\'\"]+)['\"]?"
  type_regex = "type=" + attribute_value_regex
  action_regex = "action=" + attribute_value_regex
  icon_regex = "icon=" + attribute_value_regex
  title_regex = "title=" + attribute_value_regex
  disposition_regex = "disposition=" + attribute_value_regex
  href_regex = "href=" + attribute_value_regex
 
  def _get_value(self, regex, text):
    match = re.search(regex, text, flags = re.I) 
    if match is None:
      return None
    else:
      return match.groups(0)[0]

    return None

  def _parse_type(self, text):
    return self._get_value(IntentParser.type_regex, text)

  def _parse_action(self, text):
    return self._get_value(IntentParser.action_regex, text)

  def _parse_icon(self, text):
    return self._get_value(IntentParser.icon_regex, text)

  def _parse_title(self, text):
    return self._get_value(IntentParser.title_regex, text)

  def _parse_href(self, text):
    return self._get_value(IntentParser.href_regex, text)

  def _parse_disposition(self, text):
    return self._get_value(IntentParser.disposition_regex, text)

  def _parse_page_title(self, text):
    return self._get_value(IntentParser.page_title_regex, text)

  def parse(self, text, base):
    intents = []
    page_title = self._parse_page_title(text)

    for match in re.finditer(IntentParser.intent_regex, text, flags = re.I | re.M | re.S):
      result = match.groups(0)[0]
      type = self._parse_type(result)
      type_major, type_minor = ("*", None)
      
      favicon = self._parse_icon(result)
      if favicon is None:
        favicon = urlparse.urljoin(base, "favicon.ico")
      else:
        favicon = urlparse.urljoin(base, favicon)

      if type:
        type_major, type_minor = type.split("/")
      
      href = urlparse.urljoin(base, self._parse_href(result))
      parsed_url = urlparse.urlparse(href) 
      intent = {
        "title": self._parse_title(result) or page_title,
        "icon": favicon, 
        "action": self._parse_action(result),
        "href": href,
        "domain": parsed_url[1],
        "type_major": type_major,
        "type_minor": type_minor,
        "disposition": self._parse_disposition(result) or "window"
      }
      intents.append(intent)

    return intents

  @staticmethod
  def create_key(intent):
    return intent["href"] + intent["action"] + intent["type_major"] + intent["type_minor"]
