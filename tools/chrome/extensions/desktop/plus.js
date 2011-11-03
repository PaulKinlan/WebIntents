var addIntent = function() {
  // Always add the intent in.
  var intentEl = document.createElement("intent");
  intentEl.setAttribute("action", "http://webintents.org/share");
  intentEl.setAttribute("type", "text/uri-list");
  intentEl.setAttribute("href", document.location.href);
  document.head.appendChild(intentEl);
};

var checkIntent = function() {
    var interval = setInterval(function() {
      debugger;
      if (!!window.intent == false) return;
      clearInterval(interval);
      var share = document.querySelector(".c-i-f-C");
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent("click");
      share.dispatchEvent(ev);
      setTimeout(function() {
        var se = document.querySelector(".m-n-f-ba-rd");
        se.textContent = window.intent.data;
      }, 1000);

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
