var id;
var launchedWindow;
var callbacks = {};

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
    // Find the actions that are of the correct type (or not).  Does not handle /*, yet
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

window.addEventListener("message", function(e) {
  var data = JSON.parse(e.data);
  var timestamp = (new Date()).valueOf();
  
  if(data.request && data.request == "register") {
    Intents.addAction(data.intent);
  }
  else if(data.request && data.request == "startActivity") {
    // The Picker is open, tell it what it can display.
    var actions = Intents.getActions(data.intent);

    var intentData = {
      id: data.intent._id,
      intent: data.intent,
      state: "startActivity",
      timestamp: timestamp,
    };

    // Change the window name
    window.name = "picker";

    localStorage[data.intent._id] = JSON.stringify(intentData);
    IntentController.renderActions(actions, data.intent);
  }
  else if(data.request && data.request == "registerCallback") {
    callbacks[data.id] = {};
  }
  else if(data.request && data.request == "launched") {
    // The app has launched, send it the intent data.
    var launchId = data.name;
    var intent = JSON.parse(localStorage[launchId]);
    var message = JSON.stringify({"request" : "intentData",  intent: intent.intent});
    launchedWindow.postMessage(message, "*");
    localStorage.removeItem(launchId);
    setTimeout(function() { window.close(); });
  }
  else if(data.request && data.request == "response") {
    // an intent has completed, route it back to the parent. 
    var id = data.intent._id;
    var intentData = {
      id: id,
      intent: data.intent,
      "window": window.name,
      state: "response",
      timestamp: timestamp
    };
    localStorage[id] = JSON.stringify(intentData);
  }
}, false);

window.addEventListener("storage", function(e) {
  // Intent messages are stored in localStorage as a synch mechanism.
  // This is a dirty hack.
  var vals = localStorage[e.key];
  var data = JSON.parse(vals);
  if(data && data.intent && data.state == "response" && callbacks[e.key]) {
    delete callbacks[e.key];
    localStorage.removeItem[data.intent._id];
    var message = JSON.stringify({ intent: data.intent, request: "response" });
    window.parent.postMessage(
      message,
      "*");
  }
}, false);
