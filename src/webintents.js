(function() {
  var server = __WEBINTENTS_ROOT; 
  var serverSource = server + "intents.html";
  var pickerSource = server + "picker.html";
  var iframe;

  var Intents = function() {
  };

  /*
   * Starts an activity.
   */
  Intents.prototype.startActivity = function (intent, onResult) {
    var w = window.open(pickerSource, "_blank", "width=300, height=300");
    var handler = new messageHandler(intent, onResult);
    window.addEventListener("message", handler.handler, false);
  };

  var _str = function(obj) {
    return JSON.stringify(obj);
  }

  var messageHandler = function(intent, onResult) {
    var self = this;
    this.handler = function(e) {
      var data = JSON.parse(e.data);
      if(data.request && 
         data.request == "ready") {

        var channel = new MessageChannel();
        var ports;
      
        var id = "intent." + new Date().valueOf();
        intent._id = id;
        //port1 will be our response message handler, only if there is a callback defined
        if(onResult) {
          ports = [channel.port2];

          channel.port1.start();
          channel.port1.addEventListener("message", function(evt) {
            var msgData = JSON.parse(evt.data);
            onResult(msgData.intent);
            channel.port1.close();
            channel.port2.close();  
          });

          iframe.contentWindow.postMessage(
            _str({ request: "registerReturn", intent: intent}),
            ports,
            "*"
          );
        }
        e.source.postMessage(
          _str({ request: "startActivity", intent: intent }),
          [], "*"
        );
        // We really need to remove this message handler
        window.removeEventListener("message", self.handler, false);
      } 
  }};

  window.addEventListener("load", function() {
    // This is an app that has been launced via the picker. 
    if(window.opener && window.opener.closed == false) {
      var channel = new MessageChannel();
      channel.port1.addEventListener("message", function(message) {
        var data = JSON.parse(message.data);
        var intent = new Intent();
        intent._id  = data.intent._id;
        intent.action = data.intent.action;
        intent.type = data.intent.type;
        intent.data = data.intent.data;

        // This will recieve the intent data.
        if(window.navigator.intents.onActivity) {
          window.navigator.intents.onActivity(intent);
        } 
      }, false);
      channel.port1.start();
      channel.port2.start();

      window.opener.postMessage(_str({ request: "launched", name: window.name }), [channel.port2], "*");
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

    window.addEventListener("DOMContentReady",function() {
      // The DOM is ready, tell the opener that we can are ready.
      var channel = new MessageChannel();
      channel.port1.addEventListener("message", function() {
        
      }, false);

      window.postMessage(_str({request: "ready"}),[channel.port2], server);
    }, false);

    window.addEventListener("submit", handleFormSubmit);
  };

  init();
})();
