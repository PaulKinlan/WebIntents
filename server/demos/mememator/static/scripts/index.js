var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

var context;
var canvas;
var imageID;
var permissionKey;

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

    if(imageID) {
      updateImageData(imageID, canvas, topText, bottomText);
      // set a timeout to check for when an image becomes available.
    }
  }
}

var createNewImage = function(c) {
  var data = c.toDataURL('image/png');
  // Create an image.
  $.ajax({
    type: 'POST', 
    url: '/image',
    data: {image: data},
    success: function(data) {
      imageID = data.id;
      permissionKey = data.permissionKey;
    } 
  });
};

var createBlobFromCanvas = function(c) {
  var data = c.toDataURL('image/png');
  return data; // until blob issue fixed
  return dataURLToBlob(data);
};

var updateImageData = function(id, c, textTop, textBottom) {
  var data = c.toDataURL('image/png');
  $.ajax({
    type: 'PUT', 
    url: '/image/' + id,
    data: { image: data, permissionKey: permissionKey, textTop: textTop, textBottom: textBottom },
    success: function(data) {
    } 
  });
};

var updateImage = function(data) {
  var url = $.isArray(data) ? data[0] : data;
  if(data.constructor.name == "Blob" || data instanceof Blob) {
    url = webkitURL.createObjectURL(data);
  }
  
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

    createNewImage(canvas);

    if(window.intent) {
      $('#done').show();
    }
    else {
      $('#save').show();
      $('#share').show();
      $('#sharelink').show();
    }
  });
  loadImage(img, url);
}; 
    
$(function() {
  var idLocation = window.location.search.indexOf("id=");
  
  if (window.intent || idLocation > -1)   {
    $('#done').show();
    $('#done').click(function() {
      if (canvas) {
        var url = "http://www.mememator.com/image/" + imageID + ".png"; 
        window.intent.postResult(url);
      }
    });
    if(window.intent) {
      updateImage(window.intent.data);
    }
    else {
      // This will open the image and then upload it again, this is fine as it is a new edit sequence.
      var imageIDMatch = window.location.search.match(/id=(\d+)/);
      if(imageIDMatch.length == 2) {
        var newImageID = imageIDMatch[1];
        updateImage("http://www.mememator.com/image/" + newImageID + ".png");
      }
    }
  }
  else {
    $('#container').click(function() {
       $('#save').hide();
       $('#share').hide();
       $('#sharelink').hide();
       $('#done').hide();

       var i = new Intent("http://webintents.org/pick", "image/*");
       startActivity.call(window.navigator, i, function(data) {
         updateImage(data); 
       });
    });
  }
      
  $('#save').click(function() {
    var canvas = $('#container canvas')[0];
    var data = createBlobFromCanvas(canvas); 
    var i = new Intent("http://webintents.org/save", "image/png", data);
    startActivity.call(window.navigator, i);
  });
      
  $('#share').click(function() {
    var canvas = $('#container canvas')[0];
    var data = createBlobFromCanvas(canvas); 
    var i = new Intent("http://webintents.org/share", "image/png", data);
    startActivity.call(window.navigator, i);
  });
 
  $('#sharelink').click(function() {
    var url = "http://www.mememator.com/image/" + imageID + ".html";
    var i = new Intent("http://webintents.org/share", "text/uri-list", url);
    startActivity.call(window.navigator, i);
  });

  $('#top').change(textChanged);
  $('#bottom').change(textChanged);
});

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
 }
