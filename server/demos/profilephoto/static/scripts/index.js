var video;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

var snapPicture = function() {
  var newcanvas = document.createElement("canvas");
  var newContext = newcanvas.getContext("2d");
  newcanvas.width = 640;
  newcanvas.height = 480;
  newContext.drawImage(video, 0, 0, 640, 480);
  $("#snaps").append(newcanvas);
};

$(function() {
  // Hook up the video camera.
  video = $("video")[0];

  if(navigator.getUserMedia) {
    navigator.getUserMedia("video", function(s) {
      video.src = URL.createObjectURL(s);
    });
  }

  if (window.intent) {
    $('#snaps canvas').live('click', function() {
        window.intent.postResult(this.toDataURL());
        window.setTimeout(function() { window.close(); }, 1000);
    });
  }
  else {
    $('#snaps canvas').live('click', function() {
      $("#save").show();
      $("#share").show();
      $("#snaps canvas").removeClass("selected");
      $(this).addClass("selected")
    });

    $('#container video').click(function() {
       // Snap straight away.
       snapPicture();
    });
  }
      
  $('#save').click(function() {
    var canvas = $("#snaps canvas.selected")[0];
    var i = new Intent("http://webintents.org/save", "image/*", canvas.toDataURL());
    window.navigator.startActivity(i);
  });
      
  $('#share').click(function() {
    var canvas = $("#snaps canvas.selected")[0];
    var i = new Intent("http://webintents.org/share", "image/*", canvas.toDataURL());
    window.navigator.startActivity(i);
  });
});
