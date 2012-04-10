var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

$(function() {
  $('#images img').click(function(e) {
    if(!!window.intent == false) {
      var i = new Intent("http://webintents.org/edit", "image/*", this.src);
      startActivity.call(window.navigator, i);
    }
    else {
      window.intent.postResult(this.src);
      setTimeout(function() { window.close(); }, 1000);
    }
  });
});
