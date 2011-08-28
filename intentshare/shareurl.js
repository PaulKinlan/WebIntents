function shareURL(url) {
  var intent = new Intent();
  intent.action = "http://webintents.org/share";
  intent.type = "text/uri-list";
  intent.data = [ url ];

  try {
      window.navigator.startActivity(intent);
  } catch (e) {
      alert(e.stack);
  }
}

chrome.extension.onRequest.addListener(function(request) {
  shareURL(request);
});