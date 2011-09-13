// Copyright 2011 Google Inc. All Rights Reserved.

function uploadImage(e) {
  if (window.intent) {
    data = $.isArray(window.intent.data) ? window.intent.data[0] : window.intent.data;
    $.post('twitpic/upload', { 'img': data }, function(data) {
      var url = data.url;
      var id = url.substring(url.lastIndexOf('/') + 1);
      intent.postResult('http://twitpic.com/show/thumb/' + id);
      window.setTimeout(function() { window.close(); }, 500);
    }, 'json');
  } else {
    window.location = '/';
  }
}
