var context;
var canvas;
function textChanged() {
  if (context) {
    topText = $('#top').val();
    bottomText = $('#bottom').val();
     var image = $('#image')
    var width = image.width();
    var height = image.height();
    context.drawImage(image.get()[0], 0, 0);
    context.font = "36px Sigmar One";
    context.textAlign = "center";
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.fillText(topText, width * 0.5, height * 0.1, width * 0.9);
    context.strokeText(topText, width * 0.5, height * 0.1, width * 0.9);
        
    context.fillText(bottomText, width * 0.5, height * 0.95, width * 0.9);
    context.strokeText(bottomText, width * 0.5, height * 0.95, width * 0.9);
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

    canvas.width = image.width();
    canvas.height = image.height();
    context = canvas.getContext('2d');
    context.drawImage(image.get()[0], 0, 0);
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
       window.navigator.startActivity(i, function(data) {
         updateImage(data); 
       });
    });
  }
      
  $('#save').click(function() {
    var i = new Intent("http://webintents.org/save", "image/*", canvas.toDataURL());
    window.navigator.startActivity(i);
  });
      
  $('#share').click(function() {
    var i = new Intent("http://webintents.org/share", "image/*", canvas.toDataURL());
    window.navigator.startActivity(i);
  });

  $('#top').change(textChanged);
  $('#bottom').change(textChanged);
});
 
