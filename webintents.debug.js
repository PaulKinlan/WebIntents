(function() {
  if(!!window.Intent) return;

  var addEventListener = function(obj, type, func, capture) {
    if(!!window.addEventListener) {
      obj.addEventListener(type, func, capture);
    }
    else {
      obj.attachEvent("on" + type, func);
    }
  };

  if(document.location.host == "0.0.0.0:8000") {   var __WEBINTENTS_ROOT = "http://0.0.0.0:8080/"; } else {   var __WEBINTENTS_ROOT = "http://webintents.org/"; }
 
  var server = __WEBINTENTS_ROOT; 
  var serverSource = server + "intents.html";
  var pickerSource = server + "picker.html";
  var iframe;
  var channels = {};
  var intents = {};

  var Intents = function() {
  };

  /*
   * Starts an activity.
   */
  Intents.prototype.startActivity = function (intent, onResult) {
    var id = "intent." + new Date().valueOf();
    var winx = (document.all)?window.screenLeft:window.screenX;
    var winy = (document.all)?window.screenTop:window.screenY;
    var params = "directories=no,menubar=no,status=0,location=0,fullscreen=yes";
    var w = window.open(pickerSource, id, params);
    w.resizeTo(300,300);
    w.moveTo(winx + 40, document.body.offsetHeight + winy);
    intent._id = id;
    intents[id] = { intent: intent }; 
    if(onResult) {
      iframe.contentWindow.postMessage(
        _str({"request": "registerCallback", "id": id }), 
        source );
      intents[id].callback = onResult;
    }
  };

  var _str = function(obj) {
    return JSON.stringify(obj);
  };

  var handler = function(e) {
    var data = JSON.parse(e.data);
    if(data.request && 
       data.request == "ready") {
      // The picker is ready
      var id = data.id;
      var intent = intents[id];
      
      // Send the intent data to the app.
      e.source.postMessage(
        _str({ request: "startActivity", intent: intent.intent }),
        pickerSource 
      );
    }
    else if(data.request &&
            data.request == "intentData") {
      loadIntentData(data.intent);
    }
    else if(data.request &&
            data.request == "response") {
      intents[data.intent._id].callback(data.intent);
    }
  };

  addEventListener(window, "message", handler, false);

  var loadIntentData = function(data) {
    var intent = new Intent();
    intent._id  = data._id;
    intent.action = data.action;
    intent.type = data.type;
    intent.data = data.data;
    // This will recieve the intent data.
    window.intent = intent;
  };
  
  var register = function(action, type, url, title, icon) {
    if(!!url == false) url = document.location.toString();
    if(url.substring(0, 7) != "http://" && 
       url.substring(0, 8) != "https://") {
      if(url.substring(0,1) == "/") {
        // absolute path
        url = document.location.origin + url;
      }
      else {
        // relative path
        path = document.location.href;
        path = path.substring(0, path.lastIndexOf('/') + 1);
        url = path + url;  
      }
    }

    iframe.contentWindow.postMessage(
      _str({
        request: "register", 
        intent: { action: action, type: type, url: url, title: title, icon: icon, domain: window.location.host } 
      }), 
      serverSource);
  };

  var Intent = function(action, type, data) {
    var me = this;
    this.action = action;
    this.type = type;
    this.data = data;

    this.postResult = function (data) {
      var returnIntent = new Intent();
      returnIntent._id = me._id;
      returnIntent.action = me.action;
      returnIntent.data = data;
    
      iframe.contentWindow.postMessage(
        _str({
          request: "response",
          intent: returnIntent 
        }),
        "http://webintents.org");
    };
  };

  Intent.SHARE = "http://webintents.org/share"; 
  Intent.SEND = "http://webintents.org/send"; 
  Intent.EDIT = "http://webintents.org/edit"; 
  Intent.VIEW = "http://webintents.org/view"; 
  Intent.PICK = "http://webintents.org/pick"; 


  var getFavIcon = function() {
    var links = document.getElementsByTagName("link");
    var link;
    for(var i = 0; link = links[i]; i++) {
      if((link.rel == "icon" || link.rel == "shortcut") && !!link.href ) {
        var url = link.href;
        if(url.substring(0, 7) != "http://" && 
          url.substring(0, 8) != "https://") {
          if(url.substring(0,1) == "/") {
            // absolute path
            return document.location.origin + url;
          }
          else {
            // relative path
            path = document.location.href;
            path = path.substring(0, path.lastIndexOf('/') + 1);
            url = path + url;  
          }
        }
        else {
          return url;
        }
      }
    }

    return window.location.origin + "/favicon.ico";
  };

  var parseIntentsMetaData = function() {
    var intents = document.getElementsByTagName("meta");
    var intent;
    for(var i = 0; intent = intents[i]; i++) {
      var name = intent.getAttribute("name");
      if(name == "intent") {
        var title = intent.getAttribute("title");
        var href = intent.getAttribute("href");
        var action = intent.getAttribute("content");
        var type = intent.getAttribute("type");
        var icon = intent.getAttribute("icon") || getFavIcon();
  
        register(action, type, href, title, icon);
      }
    }
  };

  var parseIntentTag = function(intent) {
    var title = intent.getAttribute("title");
    var href = intent.getAttribute("href");
    var action = intent.getAttribute("action");
    var type = intent.getAttribute("type");
    var icon = intent.getAttribute("icon") || getFavIcon();

    if(!!action == false) return;

    register(action, type, href, title, icon);
  };

  var parseIntentsDocument = function() {
    var intents = document.getElementsByTagName("intent");
    var intent;
    for(var i = 0; intent = intents[i]; i++) {
      parseIntentTag(intent);
    }
  };

  var handleFormSubmit = function(e) {
    var form = e.target;

    if(form.method.toLowerCase() == "intent") {
      e.preventDefault();
      var action = form.action;
      var enctype = form.getAttribute("enctype");
      var data = {};
      var element;

      for(var i = 0; element = form.elements[i]; i++) {
        if(!!element.name) {
          var name = element.name;
          if(!!data[name]) {
            // If the element make it an array
            if(data[name] instanceof Array) 
              data[name].push(element.value);
            else {
              var elements = [data[name]];
              elements.push(element.value);
              data[name] = elements;
            }
          }
          else {
            data[name] = element.value;
          }
        }

      }

      var intent = new Intent(action, enctype, data);
       
      window.navigator.startActivity(intent);
    
      return false;
    }
  };

  var onIntentDOMAdded = function(e) {
    if(e.target.tagName == "INTENT") {
      parseIntentTag(e.target) 
    }
  };

  var getIntentData = function() {
    if(window.opener && window.opener.closed == false) {
      iframe.contentWindow.postMessage(
       _str({ request: "launched", name: window.name }), 
       "*");
    }
  };

  var init = function () {
    var intents = new Intents();
    window.Intent = Intent;
    window.navigator.startActivity = intents.startActivity;

    if(window.name) {
      try {
        loadIntentData(JSON.parse(window.name));
        window.name = "";
      } catch(ex) {
        // If the window.name is not intent data, get it from the subsystem.
        getIntentData();
      }
    }
    else {
      getIntentData();
    }
   
    if(!!window.postMessage) {
      // We can handle postMessage.
      iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = serverSource;

      addEventListener(iframe, "load", function() {
        parseIntentsDocument();
        parseIntentsMetaData();
      }, false);

      // Listen to new "intent" nodes.
      addEventListener(document.head, "DOMNodeInserted", onIntentDOMAdded, false);
      document.head.appendChild(iframe);
    }

    if(window.opener) {
      window.opener.postMessage(_str({request: "ready"}), server);
    }

    addEventListener(window, "submit", handleFormSubmit, false);
  };

  init();
})();
