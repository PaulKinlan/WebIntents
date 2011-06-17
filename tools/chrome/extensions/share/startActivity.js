
var port = chrome.extension.connect();
port.onMessage.addListener(function(intent) {
  // There has been a share intent called
  window.navigator.startActivity(intent);
});
