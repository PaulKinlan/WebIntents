// Copyright 2011 Google Inc. All Rights Reserved.
function loadImage(img, url) {
  if(url.substring(0,4) == "data" || url.substring(0,4) == "blob") {
    img.attr('src', url);
  }
  else {
    img.attr('src', 'proxy?url=' + encodeURIComponent(url));
  }
}
