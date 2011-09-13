// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Description of this file.
 * @author tpayne@google.com (Tony Payne)
 */
function loadImage(img, url) {
  img.attr('src', '/proxy?url=' + encodeURIComponent(url));
}

function imageData(canvas) {
  return canvas.toDataUri();
}

