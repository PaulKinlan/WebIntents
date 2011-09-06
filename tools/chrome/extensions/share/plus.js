var addIntent = function() {
  // Always add the intent in.
  var intentEl = document.createElement("intent");
  intentEl.setAttribute("action", "http://webintents.org/share");
  intentEl.setAttribute("type", "text/uri-list");
  intentEl.setAttribute("href", document.location.href);
  document.head.appendChild(intentEl);
};

var checkIntent = function() {
    setTimeout(function() {
      if (!!window.intent == false) return;
      var shareElement = document.getElementById(":3r.f");
      se.innerText = window.intent.data;
      se.focus();
    }, 1000);
}

if(document.readyState == "complete") {
  addIntent();
  checkIntent();
}
else {
  window.addEventListener("load", addIntent, false);
  window.addEventListener("load", checkIntent, false);
}
