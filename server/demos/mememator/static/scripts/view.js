var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

var context;
var canvas;
var imageID;
var permissionKey;

var updateImage = function(data) {
  var url = $.isArray(data) ? data[0] : data;
  var img = $('#image');
  loadImage(img, url);
}; 
    
$(function() {
  var idLocation = window.location.search.indexOf("id=");
  
  if (idLocation > -1)   {
    var imageIDMatch = window.location.search.match(/id=(\d+)/);
    if(imageIDMatch.length == 2) {
      imageID = imageIDMatch[1];
      updateImage("http://www.mememator.com/image/" + imageID);
    }
  }
  
  $('#save').click(function() {
    var url = "http://www.mememator.com/image/" + imageID; 
    var i = new Intent("http://webintents.org/save", "image/*", url);
    startActivity.call(window.navigator, i);
  });

  $('#share').click(function() {
    var url = "http://www.mememator.com/image/" + imageID; 
    var i = new Intent("http://webintents.org/share", "image/*", url);
    startActivity.call(window.navigator, i);
  });

  $('#sharelink').click(function() {
    var url = "http://www.mememator.com/?id=" + imageID; 
    var i = new Intent("http://webintents.org/share", "text/uri-list", url);
    startActivity.call(window.navigator, i);
  });
});
