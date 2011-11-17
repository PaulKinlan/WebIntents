(function(intentName) {
  intentName = document.encodeURIComponent(intentName);
  document.writeln("<iframe src='/" + intentName + ".html' class='intent_widget'></iframe>");
})(/*__EMBED__*/);
