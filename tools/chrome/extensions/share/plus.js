var shareElement = document.getElementById(":3r.f");

if(window.intent) {
  shareElement.innerText = window.intent.data;
}

var addIntent = function() {
  // Always add the intent in.
  var intentEl = document.createElement("intent");
  intentEl.setAttribute("action", "http://webintents.org/share");
  intentEl.setAttribute("type", "text/uri-list");
  document.head.appendChild(intentEl);
};

var checkIntent = function() {
  setTimeout(function() {
     var script = document.createElement("script");
     var scriptText = "if (window.intent) {";
     scriptText += "alert(window.intent.data);";
     scriptText += "}";
     script.textContent = scriptText;
     document.head.appendChild(script);
  }, 0);
};

if(document.readyState == "complete") {
  addIntent();
  checkIntent();
}
else {
  window.addEventListener("load", addIntent, false);
  window.addEventListener("load", checkIntent, false);
}
