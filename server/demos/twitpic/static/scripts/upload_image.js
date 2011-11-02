// Copyright 2011 Google Inc. All Rights Reserved.
function uploadImage(img) {
  var data = getImageData(img);
  $.post('upload', { 'img': data }, function(d) {
    var url = d.url;
    var id = url.substring(url.lastIndexOf('/') + 1);
    intent.postResult('http://twitpic.com/show/thumb/' + id);
  }, 'json');
}

function loadImage(img, url) {
  if(url.substring(0,4) == "data") {
    img.src = url;
  }
  else {
    img.src = 'proxy?url=' + encodeURIComponent(url);
  }
}
