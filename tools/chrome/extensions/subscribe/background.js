function clickHandler(info, tab) {
  if(info.mediaType == "image" ||
     info.mediaType == "video" ||
     info.mediaType == "audio") {
     var i = new WebKitIntent({"action": "http://webintents.org/subscribe", "type": info.mediaType + "/*", "data": info.srcUrl});
     window.navigator.webkitStartActivity(i);
   }
   else if(!!info.linkUrl) {
     var i = new WebKitIntent({"action": "http://webintents.org/subscribe", "type": "text/uri-list", "data": info.linkUrl });
     window.navigator.webkitStartActivity(i, function() {}, function() {});
   }
};

chrome.browserAction.onClicked.addListener(function(tab) {
  clickHandler({linkUrl: tab.url}, tab);
});

chrome.contextMenus.create({
  "title" : "Subscribe",
  "type" : "normal",
  "contexts" : ["link", "image", "page", "video", "audio"],
  "onclick" : clickHandler 
}); 
