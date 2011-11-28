import unittest
import intentparser

class IntentParserTestFunction(unittest.TestCase):

  def setUp(self):
    self.parser = intentparser.IntentParser()

  def test_basic(self):
    intentStr = "<intent type='image/*' action='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr)

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")

  def test_multiline_basic(self):
    intentStr = "<intent \ntype='image/*' \naction='http://webintents.org/test' />"
    intents = self.parser.parse(intentStr)

    self.assertEqual(len(intents), 1)
    self.assertEqual(intents[0]["type_major"], "image")
    self.assertEqual(intents[0]["type_minor"], "*")
    self.assertEqual(intents[0]["action"], "http://webintents.org/test")



