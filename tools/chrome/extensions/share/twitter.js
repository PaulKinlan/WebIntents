var addIntent = function() {
  // Always add the intent in.
  var intentEl = document.createElement("intent");
  intentEl.setAttribute("action", "http://webintents.org/share");
  intentEl.setAttribute("type", "text/uri-list");
  intentEl.setAttribute("href", document.location.href);
  document.head.appendChild(intentEl);
};

var checkIntent = function() {
<<<<<<< HEAD
    setTimeout(function() {
      if (!!window.intent == false) return;
      var se = document.getElementsByClassName('twitter-anywhere-tweet-box-editor')[0];
      se.value = window.intent.data;
      se.focus();
    }, 1000);
=======
  setTimeout(function() {
     var script = document.createElement("script");
     var scriptText = "if (window.intent) {";
     scriptText += "var se = document.getElementsByClassName('twitter-anywhere-tweet-box-editor')[0];";
     scriptText += "se.value = window.intent.data;";
     scriptText += "se.focus(); }";
     script.textContent = scriptText;
     document.head.appendChild(script);
  }, 2000);
>>>>>>> b8b342dbc75b18a4a93cbf5976952e3d68002e4c
}

if(document.readyState == "complete") {
  addIntent();
  checkIntent();
}
else {
  window.addEventListener("load", addIntent, false);
  window.addEventListener("load", checkIntent, false);
}
