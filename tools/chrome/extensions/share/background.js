function clickHandler(info, tab) {
  var type = (info.mediaType) ? info.mediaType + "/*" : "text/uri-list" ;
  var url = (info.mediaType) ? info.srcUrl : info.linkUrl;
  var data = {
    "via": tab.pageUrl,
    "content-type": type, 
    "url": url
  };

  var i = new WebKitIntent({"action": "http://webintents.org/share", "type": "text/uri-list", "data": data });
  window.navigator.webkitStartActivity(i, function() {}, function() {});
};

chrome.browserAction.onClicked.addListener(function(tab) {
  clickHandler({linkUrl: tab.url, pageUrl: tab.url}, tab);
});


chrome.contextMenus.create({
  "title" : "Share link",
  "type" : "normal",
  "contexts" : ["link"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share link to image",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share link to page",
  "type" : "normal",
  "contexts" : ["page"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share link video",
  "type" : "normal",
  "contexts" : ["video"],
  "onclick" : clickHandler 
}); 

chrome.contextMenus.create({
  "title" : "Share link to audio",
  "type" : "normal",
  "contexts" : ["audio"],
  "onclick" : clickHandler 
}); 
