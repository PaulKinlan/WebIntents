// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Description of this file.
 * @author tpayne@google.com (Tony Payne)
 */
function loadImage(img, url) {
  if(url.substring(0,4) == "data") {
    img.attr('src', url);
  }
  else {
    img.attr('src', 'proxy?url=' + encodeURIComponent(url));
  }
}
