var Intent = window.Intent || window.WebkitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;



var context;
var canvas;
var draw = function(topline, bottomline) {
  var image = $("#image");
  var width = image.width();
  var height = image.height();
  var canvasWidth = width + 100;
  var canvasHeight = height + 200; 
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.parentElement.parentElement.style.height = canvasHeight + "px";
  canvas.parentElement.parentElement.style.width = canvasWidth + "px";
  context = canvas.getContext('2d');
  context.save();
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0, canvas.width, canvas.height);
    context.save();
      context.strokeStyle = "rgb(255,255,255)";
      context.lineWidth = 2;
      context.strokeRect(46, 46, width + 8, height + 8);
    context.restore();
    context.drawImage(image.get()[0], 50, 50);
    context.save();
      context.font = "62px Josefin Slab";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.fillText(topline, canvasWidth * 0.5, height + 105, canvasWidth * 0.9);
    context.restore();
    context.save();
      context.font = "24px Josefin Slab";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.fillText(bottomline, canvasWidth * 0.5, height + 150, canvasWidth * 0.9);
    context.restore();
   context.restore();
};

function textChanged() {
  if (context) {
    topText = $('#top').val() || "";
    bottomText = $('#bottom').val() || "";
    draw(topText, bottomText);
  }
}
     
var updateImage = function(data) {
  var url = $.isArray(data) ? data[0] : data;
  var img = $('#image');
  img.load(function() {
    var image = $('#image');
    canvas = $('#container canvas');
    if(canvas.length == 0) {
      canvas = document.createElement('canvas');
      $('#container').append(canvas);
    }
    else
      canvas = canvas[0];

    draw("","");

    if(window.intent) {
      $('#done').show();
    }
    else {
      $('#save').show();
      $('#share').show();
    }
  });
  loadImage(img, url);
}; 
    
$(function() {
  if (window.intent) {
    $('#done').show();
    $('#done').click(function() {
      if (canvas) {
        window.intent.postResult(canvas.toDataURL());
        window.setTimeout(function() { window.close(); }, 1000);
      }
    });

    updateImage(window.intent.data);
  }
  else {
    $('#container').click(function() {
       $('#save').hide();
       $('#share').hide();
       $('#done').hide();

       var i = new Intent("http://webintents.org/pick", "image/*");
       startActivity.call(window.navigator, i, function(data) {
         updateImage(data); 
       });
    });
  }
      
  $('#save').click(function() {
    var i = new Intent("http://webintents.org/save", "image/*", canvas.toDataURL());
    startActivity.call(window.navigator);
  });
      
  $('#share').click(function() {
    var i = new Intent("http://webintents.org/share", "image/*", canvas.toDataURL());
    startActivity.call(window.navigator, i);
  });

  $('#top').change(textChanged);
  $('#bottom').change(textChanged);
});
