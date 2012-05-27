// Copyright 2011 Google Inc. All Rights Reserved.

var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder;

function loadImage(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    // convert array buffer to blob.
    var bb = new BlobBuilder();
    bb.append(xhr.response);
    
    callback(bb.getBlob());
  };
  xhr.responseType = 'arraybuffer';
  xhr.open("GET", "proxy?url=" + encodeURIComponent(url));
  xhr.send();
}
