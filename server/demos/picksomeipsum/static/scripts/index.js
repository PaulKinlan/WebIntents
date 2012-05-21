var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;
    
$(function() {
  var ipsumEl = document.getElementById("ipsum");

  var createParagraph = function() {
    var p = document.createElement("p");
    p.textContent = _.paragraph();
    ipsumEl.appendChild(p);
  }

  var removeParagraph = function() {
    $("#ipsum p:last-child").remove();
  }
  
  createParagraph();

  if (window.intent) {
    $('#done').show();
    $('#done').click(function() {
      var ipsome = document.getElementById("ipsum").textContent;
      window.intent.postResult(ipsome);
    });
  }
  else {
    $('#save').show();
    $('#share').show();
  }

  $('#more').click(function() {
    createParagraph();
  });

  $('#less').click(function() {
    removeParagraph();
  });
      
  $('#save').click(function() {
    var ipsome = document.getElementById("ipsum").textContent;
    var i = new Intent("http://webintents.org/save", "text/plain", ipsome);
    startActivity.call(window.navigator, i);
  });
      
  $('#share').click(function() {
    var ipsome = document.getElementById("ipsum").textContent;
    var i = new Intent("http://webintents.org/share", "text/plain", ipsome);
    startActivity.call(window.navigator, i);
  });
});
 
