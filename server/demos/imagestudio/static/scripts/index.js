$(function() {
   var Intent = window.Intent || window.WebKitIntent;
   var startActivity = window.navigator.startActivity || window.navigator.webkitStartActivity;
   window.intent = window.intent || window.webkitIntent;
   
   var imageBlob;
   var url;
   var type = "image/*";

   var createBlobFromCanvas = function(c) {
     var data = c.toDataURL('image/png');
     return data; // until blob issue fixed.
   };

   var loadImage = function(data) {
     url = $.isArray(data) ? data[0] : data; 
     if(data.constructor.name == "Blob" || data instanceof Blob) {
       imageBlob = data;
       url = webkitURL.createObjectURL(imageBlob);
     }
    
     $("img").attr('src', url).css({ "width": "auto", "height": "auto"}).addClass('border');
     $('h2').hide();
     $('#step-wrap').show();
     $("#edit, #share, #save").removeClass("disabled").removeAttr('disabled');
   };

   if(window.intent) {
     type = window.intent.type;
     loadImage(window.intent.data);
   }

   $('#result').click(function(e) {
     var intent = new Intent( 'http://webintents.org/pick', 'image/*');
     startActivity.call(window.navigator, intent, function(data) {
       loadImage(data);
     });
   });
   
   $('h2').click(function(e){
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
     var params = {
       "action": "http://webintents.org/share",
       "type": type,
       "data": {
         "url": url,
         "blob": imageBlob
       }
     };

     var intent = new Intent(params);
     startActivity.call(window.navigator, intent);
   });
 });
