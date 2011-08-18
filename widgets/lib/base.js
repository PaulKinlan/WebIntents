(function(intentName) {
  intentName = document.encodeURIComponent(intentName);
  var baseScript = "";
  document.writeln("<iframe src='" baseScript + "/" + intentName + ".html' class='intent_widget'></iframe>");
})(/*__EMBED__*/);
