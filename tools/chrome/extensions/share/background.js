function clickHandler(info, tab) {
  var type = (info.mediaType) ? info.mediaType + "/*" : "text/uri-list" ;
  var data = {
    "via": "Chrome Share extension",
    "url": info.linkUrl,
  };

  var i = new WebKitIntent({"action": "http://webintents.org/share", "type": type, "data": data });
  window.navigator.webkitStartActivity(i, function() {}, function() {});
};

chrome.browserAction.onClicked.addListener(function(tab) {
  clickHandler({linkUrl: tab.url}, tab);
});


chrome.contextMenus.create({
  "title" : "Share Link",
  "type" : "normal",
  "contexts" : ["link"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share Image",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share Page",
  "type" : "normal",
  "contexts" : ["page"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share Video",
  "type" : "normal",
  "contexts" : ["video"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share Audio",
  "type" : "normal",
  "contexts" : ["audio"],
  "onclick" : clickHandler 
}); 
