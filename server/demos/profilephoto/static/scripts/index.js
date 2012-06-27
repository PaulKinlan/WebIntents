var video;
var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

var createBlobFromCanvas = function(c) {
  var data = c.toDataURL('image/png');
  return data; // until blob issue fixed.
  return dataURLToBlob(data);
};

// taken from filer.js by Eric Bidelman
var dataURLToBlob = function(dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
     var parts = dataURL.split(',');
     var contentType = parts[0].split(':')[1];
     var raw = parts[1];
     var bb = new WebKitBlobBuilder();
     bb.append(raw);
     return bb.getBlob(contentType);
   }
   var parts = dataURL.split(BASE64_MARKER);
   var contentType = parts[0].split(':')[1];
   var raw = window.atob(parts[1]);
   var rawLength = raw.length;
   var uInt8Array = new Uint8Array(rawLength);
   for (var i = 0; i < rawLength; ++i) {
     uInt8Array[i] = raw.charCodeAt(i);
   }
   var bb = new WebKitBlobBuilder();
   bb.append(uInt8Array.buffer);
   return bb.getBlob(contentType);
};

var snapPicture = function() {
	var wrapper = document.createElement('figure');
	var newcanvas = document.createElement('canvas');
	var newContext = newcanvas.getContext('2d');
	newcanvas.width = 640;
	newcanvas.height = 480;
	newContext.drawImage(video, 0, 0, 640, 480);
	$('article').hide(320);
	wrapper.appendChild(newcanvas);
	wrapper.className = 'ease-in';
	$('#snaps').append(wrapper);
};

$(function() {

	var buttons = $('footer').find('.btn');
	var snap = $('#snaps');
	var active = snap.find('figure.selected');
	var head = $('header');

	var actions = $('#actions');
	var figs = snap.find('figure');

	snap.on('click','figure',function(){
		snap.find('figure').removeClass('selected').addClass('non');
		snap.find('figure div').detach();
		snap.addClass('pad');
		head.addClass('pad');
		$(this).removeClass('non').addClass('selected');
		actions.fadeIn(320);
	});


  snap.on("click", "figure.selected canvas", function() { 
    if(window.intent) {
      window.intent.postResult(this.toDataURL());
      window.setTimeout(function() { window.close(); }, 1000);
    }
  });
	
	actions.on('click','#delete',function(){
		snap.find('figure.selected').removeClass('ease-in active non').addClass('ease-out');
		setTimeout(function() {
			snap.find('figure.ease-out').remove();
			actions.hide();
			snap.removeClass('pad');
			head.removeClass('pad');
		}, 800);
	});
	
  // Hook up the video camera.
  video = $("video")[0];

  if(navigator.getUserMedia) {
    navigator.getUserMedia({"video": true}, function(s) {
      video.src = URL.createObjectURL(s);
    });
  }

  $('#container video').click(function() {
     // Snap straight away.
     snapPicture();
  });
 
    $('#save').click(function() {
    var canvas = $("#snaps figure.selected canvas")[0];
    var i = new Intent("http://webintents.org/save", "image/png", createBlobFromCanvas(canvas));
    startActivity.call(window.navigator, i);
  });
      
  $('#share').click(function() {
    var canvas = $("#snaps figure.selected canvas")[0];
    var i = new Intent("http://webintents.org/share", "image/png", createBlobFromCanvas(canvas));
    startActivity.call(window.navigator, i);
  });
});
