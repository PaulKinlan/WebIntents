var Intent = window.Intent || window.WebKitIntent;
var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
window.intent = window.intent || window.webkitIntent;

var context;
var canvas;
var imageID;
var permissionKey;

var draw = function(topline, bottomline) {
  var image = $("#image")[0];
  var width = image.width;
  var height = image.height;
  var canvasWidth = width + 100;
  var canvasHeight = height + 200; 
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context = canvas.getContext('2d');
  context.save();
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0,0, canvas.width, canvas.height);
    context.save();
      context.strokeStyle = "rgb(255,255,255)";
      context.lineWidth = 2;
      context.strokeRect(46, 46, width + 8, height + 8);
    context.restore();
    context.drawImage(image, 50, 50);
    context.save();
      context.font = "62px Georgia";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.fillText(topline, canvasWidth * 0.5, height + 125, canvasWidth * 0.9);
    context.restore();
    context.save();
      context.font = "24px Georgia";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.fillText(bottomline, canvasWidth * 0.5, height + 160, canvasWidth * 0.9);
    context.restore();
   context.restore();

   if(imageID) {
     updateImageData(imageID, canvas, topline, bottomline);
   }
   $('#container').find('h2').hide();
   $('#container').addClass('loaded');
   $('#words').show();
   $('#help').hide();
   $('#top').focus();
};

function textChanged() {
  if (context) {
    topText = $('#top').val() || "";
    bottomText = $('#bottom').val() || "";
    draw(topText, bottomText);
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

    createNewImage(canvas);

    if(window.intent) {
      $('#done').show();
      $('#actions').show();
    }
    else {
      $('#done').hide();
      $('#save').show();
      $('#share').show();
      $('#actions').show();
    }
  });
  loadImage(img, url);
}; 
    
$(function() {
  var idLocation = window.location.search.indexOf("id=");
  
  if (window.intent || idLocation > -1)   {
  	$('#actions').show();
    $('#share').hide();
    $('#save').hide();

    $('#done').show();
    $('#done').click(function() {
      if (canvas) {
        window.intent.postResult(canvas.toDataURL());
      }
    });

    if(window.intent) {
      updateImage(window.intent.data);
    }
    else {
      var imageIDMatch = window.location.search.match(/id=(\d+)/);
      if(imageIDMatch.length == 2) {
        var newImageID = imageIDMatch[1];
        updateImage("http://www.inspirationmator.com/image/" + newImageID + ".png");
      }
    }
  }
  else {
    $('#container').click(function() {
       $('#save').hide();
       $('#share').hide();
       $('#done').hide();
       $('#actions').hide();

       var i = new Intent("http://webintents.org/pick", "image/*");
       startActivity.call(window.navigator, i, function(data) {
         updateImage(data); 
       });
    });
  }
      
  $('#save').click(function() {
    var url = "http://www.inspirationmator.com/image/" + imageID + ".png"; 
    var i = new Intent("http://webintents.org/save", "image/*", url);
    startActivity.call(window.navigator, i);
  });
      
  $('#share').click(function() {
    var url = "http://www.inspirationmator.com/image/" + imageID + ".png"; 
    var params = {
      "action": "http://webintents.org/share",
      "type": "image/png",
      "data": {
        "url": url,
        "blob": data
      }
    };

    var i = new Intent(params);
    startActivity.call(window.navigator, i);
  });

  $('#top').change(textChanged);
  $('#bottom').change(textChanged);
  
	var top = $('#top');
	var bot = $('#bottom');
	var help = $('#help');
	help.on('click',function(){
		$(this).fadeOut(180);
	});
	
	var btnh = $('#actions').find('.btn');
	var btn = btnh.find('.icon');
	
	btnh.hover(
	function(){
		$(this).find(btn).addClass('ani');
	},
	function(){
		$(this).find(btn).removeClass('ani');
	});
  
});
