/*
   Copyright 2011 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


var id;
var callbacks = {};

window.attachEventListener = function(obj, type, func, capture) {
  if(!!obj.addEventListener) {
    obj.addEventListener(type, func, capture);
  }
  else if(!!obj.attachEvent) {
    obj.attachEvent("on" + type, func);
  }
};

var Intents = new (function() {
 
  this.getAllActions = function () {
    var actions = [];
    for(var key in localStorage) {
      var action = JSON.parse(localStorage[key]);

      if(action instanceof Array) {
        actions.push({ key: key, actions: action });
      }
    }

    return actions;
  };

  this.getActions = function(intent) {
    if(!!intent == false) throw "No intent";
    if(!!intent.action == false) throw "No action to resolve";

    var actionData = localStorage[intent.action] || "{}";
    var actions = JSON.parse(actionData);

    if(actions instanceof Array) {
      actions = { "actions" : actions };
    }
    else if (!!actions.actions == false) {
      actions = { "actions" : [] };
    }

    var action;
    var filteredActions = { "actions": [], defaultAction: actions.defaultAction };
    // Find the actions that are of the correct type (or not).  Does not handle *, yet
    for(var i = 0; action = actions.actions[i]; i++) {
      if(intent.type == action.type || !!intent.type == false) {
        filteredActions.actions.push(action);
      }
    }

    return filteredActions;
  };

  this.clearAll = function() {
    localStorage.clear();
  };

  this.getDefault = function(action) {
    var actions = JSON.parse(localStorage[action]);
    return actions.defaultAction;
  };

  this.setDefault = function(intent) {
    var actions = JSON.parse(localStorage[intent.action]);
    if(actions instanceof Array) {
      actions = { "actions": actions };
    }
    else if (!!actions.actions == false) {
      actions = { "actions" : [] };
    }
    actions.defaultAction = intent;
    localStorage[intent.action] = JSON.stringify(actions);
  };

  this.addAction = function(intent) {
    if(!!intent == false) throw "No intent";
    if(!!intent.action == false) throw "No action to resolve";
    
    var actionData = localStorage[intent.action] || "{}";
    var actions = JSON.parse(actionData);
    
    if(actions instanceof Array) {
      // Upgrade existing intents to new format.
      actions = { "actions" : actions };
    }
    else if (!!actions.actions == false) {
      actions = { "actions" : [] };
    }

    var action;
    var found = false;
     
    // Replace an existing action. 
    for(var i = 0; action = actions.actions[i]; i++) {
      if(intent.action == action.action && intent.url == action.url && intent.type == action.type) {
        actions.actions[i] = intent;
        found = true;
        break;
      }
    }
    // Add a new action
    if(found == false) {
      actions.actions.push(intent);
    }

    localStorage[intent.action] = JSON.stringify(actions);
  };
})();

var MessageDispatcher = function() {

  this.register = function(data, timestamp, e) {
    Intents.addAction(data.intent);
  };

  this.startActivity = function(data, timestamp, e) {
    var actions = Intents.getActions(data.intent);
    var defaultAction = Intents.getDefault(data.intent.action);

    var intentData = {
      id: data.intent._id,
      intent: data.intent,
      timestamp: timestamp
    };

    if(defaultAction) {
      var intentStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(data.intent)))).replace(/=/g, "_");
      console.log(defaultAction);
      window.name = intentStr;
      window.location = defaultAction.url;
      return;
    }

    localStorage[data.intent._id] = JSON.stringify(intentData);
    IntentController.renderActions(actions, data.intent);
  };

  this.registerCallback = function(data, timestamp, e) {
    callbacks[data.id] = {};

    if(!!window.onstorage == false) {
      // We are going to have to set up something that polls.
      var timer = setInterval(function() {
        var intentStr = localStorage.getItem(data.id);
        if(!!intentStr) {
          var intentObj = JSON.parse(intentStr);
          if(intentObj.request == "sendResponse") {
            window.postMessage(intentStr, "*");
            clearInterval(timer);
          }
        }
      },1000);
    }
  };

  /*
   * The service has sent a response, route it back to the correct frame.
   */
  this.intentResponse = function(data, timestamp, e) {
    var id = data.intent._id;
    var intentData = {
      "request": "sendResponse",
      intent: data.intent,
      timestamp: timestamp
    };
    localStorage[id] = JSON.stringify(intentData);
  };

  /*
   * The correct frame has recieved the reposen, route it back to the parent app.
   */
  this.sendResponse = function(data, timestamp, e) {
    if(!!callbacks[data.intent._id] == false) {
      return;
    }
    localStorage.removeItem(data.intent._id);
    var message = JSON.stringify({ intent: data.intent, request: "response" });
    window.parent.postMessage(
      message,
      "*"  
    );
  };
};

var MessageHandler = function() {
  var dispatcher = new MessageDispatcher();
  this.handler = function(e) {
    var data;
    if(!!e.data) {
      data = JSON.parse(e.data);
    }
    else {
      var vals = localStorage[e.key];
      try {
        data = JSON.parse(vals);
      } catch(ex) {
        return;
      }
    }

    if(data.origin && data.origin !== window.name ||
       data.process && data.process == false) {
      // If there is an intended origin, then enforce it, or the system says not to listen to the event.
      return;
    }

    var timestamp = (new Date()).valueOf();

    if(dispatcher[data.request]) 
      dispatcher[data.request](data, timestamp, e);
  };
}

var msgHandler = new MessageHandler();; 

attachEventListener(window, "message", msgHandler.handler, false); 
attachEventListener(window, "storage", msgHandler.handler, false); 
attachEventListener(document, "storage", msgHandler.handler, false); 

if(!!window.onstorage) {
  // we don't have storage events, so lets poll.

}
