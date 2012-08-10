var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

var context;
var canvas;
var imageID;
var permissionKey;
 
$('#sharelink').click(function() {
  var url = window.location.href;
  var i = new Intent("http://webintents.org/share", "text/uri-list", url);
  startActivity.call(window.navigator, i);
});


