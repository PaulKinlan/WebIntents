import logging
import urlparse
import re

class IntentParser():
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

  def parse(self, text, base):
    intents = []

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

      intent = {
        "title": self._parse_title(result),
        "icon": favicon, 
        "action": self._parse_action(result),
        "href": urlparse.urljoin(base, self._parse_href(result)),
        "type_major": type_major,
        "type_minor": type_minor,
        "disposition": self._parse_disposition(result) or "window"
      }
      intents.append(intent)

    return intents


