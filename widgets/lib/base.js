(function(intentName) {
  intentName = document.encodeURIComponent(intentName);
  if(!!window.intent == false) {
    // Download the script
    document.writeln("<ifrmae src='" + intentName + ".html' class='intent_widget' />"
  }
})(/*__EMBED__*/);
