$(function() {
   var Intent = window.Intent || window.WebKitIntent;
   var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
   window.intent = window.intent || window.webkitIntent;
   
   var imageBlob;
   var url;

   var createBlobFromCanvas = function(c) {
     var data = c.toDataURL('image/png');
     return data; // until blob issue fixed.
     //return dataURLToBlob(data);
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

   var loadImage = function(data) {
     url = $.isArray(data) ? data[0] : data; 
     if(data.constructor.name == "Blob" || data instanceof Blob) {
       imageBlob = data;
       /*
       var reader = new FileReader();
       reader.onerror = function(e) { console.log(e); alert("error"); };
       reader.onload = function(e) { $("#result").attr("src", e.target.result) };
       reader.readAsDataURL(data);
       */

       url = webkitURL.createObjectURL(imageBlob);
     }
    
     $("#result").attr('src', url).css({ "width": "auto", "height": "auto"});
     $("#edit, #share, #save").removeClass("disabled")
                              .removeAttr('disabled');
   };

   if(window.intent) {
     loadImage(window.intent.data);
   }

   $('#result').click(function(e) {
     var intent = new Intent( 'http://webintents.org/pick', 'image/*');
     startActivity.call(window.navigator, intent, function(data) {
       loadImage(data);
     });
   });

   $("#edit").click(function (e) {
     var intent = new Intent( 'http://webintents.org/edit', 'image/*', imageBlob || url);
     startActivity.call(window.navigator, intent, function(data) {
       loadImage(data);
     });
   });

   $('#save').click(function(e) {
     var intent = new Intent( 'http://webintents.org/save', 'image/*', imageBlob || url);
     startActivity.call(window.navigator, intent);
   });

   $('#share').click(function() {
     var intent = new Intent( 'http://webintents.org/share', 'image/*', imageBlob || url);
     startActivity.call(window.navigator, intent);
   });
 });
 
