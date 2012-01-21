$(function() {
  $('#images img').click(function(e) {
    if(!!window.intent == false) {
      var i = new Intent("http://webintents.org/edit", "image/*", this.src);
      window.navigator.startActivity(i);
    }
    else {
      window.intent.postResult(this.src);
      setTimeout(function() { window.close(); }, 1000);
    }
  });
});
