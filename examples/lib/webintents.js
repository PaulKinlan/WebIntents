__WEBINTENTS_ROOT = "http://webintents.org/";
(function() {
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
        "*");
      intents[id].callback = onResult;
    }
  };

  var _str = function(obj) {
    return JSON.stringify(obj);
  }

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
        "*"
      );
    }
    else if(data.request &&
            data.request == "intentData") {
      loadIntentData(data.intent);
    }
    else if(data.request &&
            data.request == "response") {
      console.log("response1");
      intents[data.intent._id].callback(data.intent);
    }
  };

  window.addEventListener("message", handler, false);

  var loadIntentData = function(data) {
    var intent = new Intent();
    intent._id  = data._id;
    intent.action = data.action;
    intent.type = data.type;
    intent.data = data.data;
    console.log(intent)
    // This will recieve the intent data.
    if(window.navigator.intents.onActivity) {
      window.navigator.intents.onActivity(intent);
    } 
  };

  window.addEventListener("load", function() {
    // This is an app that has been launced via the picker. 
    if(window.opener && window.opener.closed == false) {
      window.opener.postMessage(
        _str({ request: "launched", name: window.name }), 
        "*");
    }
  }, false);

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
      "*");
  };

  /*
   * Service Registration mechanism.
   *   action: The schema type that describes the action
   *   onResult: The handler that will be called when an Activity is started with this app.
   */
  Intents.prototype.register = function (action, type) {
    register(action, type, document.location.href, document.title, getFavIcon());
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
        "*");
    };
  };

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

  var parseIntentsDocument = function() {
    var intents = document.getElementsByTagName("intent");
    var intent;
    for(var i = 0; intent = intents[i]; i++) {
      var title = intent.getAttribute("title");
      var href = intent.getAttribute("href");
      var action = intent.getAttribute("action");
      var type = intent.getAttribute("type");
      var icon = intent.getAttribute("icon") || getFavIcon();

      register(action, type, href, title, icon);
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
       
      window.navigator.intents.startActivity(intent);
    
      return false;
    }
  };

  var init = function () {
    window.Intent = Intent;
    window.navigator.intents = new Intents();
    
    if(!!window.postMessage) {
      // We can handle postMessage.
      iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = serverSource;

      iframe.addEventListener("load", function() {
        parseIntentsDocument();
        parseIntentsMetaData();
      }, false);

      if(document.body) {
        document.body.appendChild(iframe);
      }
      else {
        document.addEventListener("DOMContentLoaded", function() {
          document.body.appendChild(iframe);
        }, false);
      }
    }

    window.addEventListener("load",function() {
      // The DOM is ready, tell the opener that we can are ready.
      if(window.opener) {
        window.opener.postMessage(_str({request: "ready"}), server);
      }
    }, false);

    window.addEventListener("submit", handleFormSubmit, false);
  };

  init();
})();
