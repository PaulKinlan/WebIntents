var shareElement = document.getElementsByClassName("twitter-anywhere-tweet-box-editor")[0];

if(window.intent) {
  shareElement.innerText = window.intent.data;
}

var addIntent = function() {
  // Always add the intent in.
  var intentEl = document.createElement("intent");
  intentEl.setAttribute("action", "http://webintents.org/share");
  intentEl.setAttribute("type", "text/uri-list");
  intentEl.setAttribute("href", document.location.href);
  document.head.appendChild(intentEl);
};

if(document.readyState == "complete") {
  addIntent();
}
else {
  window.addEventListener("load", addIntent, false);
}
