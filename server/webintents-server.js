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

    var actionData = localStorage[intent.action] || "[]";
    var actions = JSON.parse(actionData);
    var action;
    var filteredActions = [];
    // Find the actions that are of the correct type (or not).  Does not handle *, yet
    for(var i = 0; action = actions[i]; i++) {
      if(intent.type == action.type || !!intent.type == false) {
        filteredActions.push(action);
      }
    }

    return filteredActions;
  };

  this.addAction = function(intent) {
    if(!!intent == false) throw "No intent";
    if(!!intent.action == false) throw "No action to resolve";
    
    var actionData = localStorage[intent.action] || "[]";
    var actions = JSON.parse(actionData);
    var action;
    var found = false;
     
    // Replace an existing action. 
    for(var i = 0; action = actions[i]; i++) {
      if(intent.action == action.action && intent.url == action.url && intent.type == action.type) {
        actions[i] = intent;
        found = true;
        break;
      }
    }
    // Add a new action
    if(found == false) {
      actions.push(intent);
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

    var intentData = {
      id: data.intent._id,
      intent: data.intent,
      timestamp: timestamp
    };

    localStorage[data.intent._id] = JSON.stringify(intentData);
    IntentController.renderActions(actions, data.intent);
  };

  this.registerCallback = function(data, timestamp, e) {
    callbacks[data.id] = {};
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
    var vals = localStorage[e.key];
    var data = JSON.parse(vals);
    localStorage.removeItem[data.intent._id];
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
