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

if(document.readyState == "complete") {
  addIntent();
}
else {
  window.addEventListener("load", addIntent, false);
}
