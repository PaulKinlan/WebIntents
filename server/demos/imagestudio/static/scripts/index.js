$(function() {
   var loadImage = function(data) {
     var url = $.isArray(data) ? data[0] : data; 
     $("#result").attr('src', url).css({ "width": "auto", "height": "auto"});
     $("#edit, #share, #save").removeClass("disabled")
                              .removeAttr('disabled');
   };

   if(window.intent) {
     loadImage(window.intent.data);
   }

   $('#choose').click(function(e) {
     var intent = new Intent( 'http://webintents.org/pick', 'image/*');
     window.navigator.startActivity(intent, function(data) {
       loadImage(data);
     });
   });

   $("#edit").click(function (e) {
     var intent = new Intent( 'http://webintents.org/edit', 'image/*', $("#result").attr("src"));
     window.navigator.startActivity(intent, function(data) {
       loadImage(data);
     });
   });

   $('#save').click(function(e) {
     var intent = new Intent( 'http://webintents.org/save', 'image/*', $('#result').attr('src'));
     window.navigator.startActivity(intent);
   });

   $('#share').click(function() {
     var intent = new Intent( 'http://webintents.org/share', 'image/*', $('#result').attr('src'));
     window.navigator.startActivity(intent);
   });
 });
 
