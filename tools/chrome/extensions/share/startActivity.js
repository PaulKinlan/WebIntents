chrome.extension.onRequest.addListener(function(intent) {
  window.navigator.startActivity(intent);
});
