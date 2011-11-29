import unittest
import intentparser

class IntentParserTestFunction(unittest.TestCase):

  def setUp(self):
    self.parser = intentparser.IntentParser()

  def test_basic(self):
    intentStr = "<intent type='image/*' action='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")

  def test_multiline_basic(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")

  def test_disposition(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' disposition='inline' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")
    self.assertEqual(intents[0]["disposition"], "inline")

  def test_icon(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' icon='fav2.ico' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")
    self.assertEqual(intents[0]["icon"], "http://webintents.org/fav2.ico")

  def test_default_disposition_value(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(intents[0]["disposition"], "window")

  def test_default_icon(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(intents[0]["icon"], "http://webintents.org/favicon.ico")

  def test_default_type(self):
    intentStr = "<intent action='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr, "http://webintents.org/")

    self.assertEqual(intents[0]["type_major"], "*")
    self.assertEqual(intents[0]["type_minor"], None)

