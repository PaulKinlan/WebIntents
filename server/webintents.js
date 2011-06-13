var id; 
var responseChannel = {};

window.addEventListener("message", function(e) {
  var timestamp = (new Date()).valueOf();
  
  if(e.data.request && e.data.request == "register") {
    Intents.addAction(e.data.intent);
  }
  else if(e.data.request && e.data.request == "startActivity") {
    // The Picker is open, tell it what it can do.
    var actions = Intents.getActions(e.data.intent);
    var intentData = {
      id: e.data.intent._id,
      intent: e.data.intent,
      state: "startActivity",
      timestamp: timestamp,
    };

    localStorage[e.data.intent._id] = JSON.stringify(intentData);
    IntentController.renderActions(actions, e.data.intent);
  }
  else if(e.data.request && e.data.request == "registerReturn") {
    // This is the return channel back to the client app.
    if(e.ports && e.ports.length > 0) {
      responseChannel[e.data.intent._id] = e.ports[0];
    }
  }
  else if(e.data.request && e.data.request == "launched") {
    // The app has launched, send it the intent data.
    var appPort = e.ports[0];
    var launchId = e.data.name;
    var intent = JSON.parse(localStorage[launchId]);
    appPort.postMessage({ intent: intent.intent }, [], "*");
    setTimeout(function() { window.close(); });
  }
  else if(e.data.request && e.data.request == "response") {
    // an intent has completed, route it back to the parent. 
    var id = e.data.intent._id;
    var intentData = {
      id: id,
      intent: e.data.intent,
      state: "response",
      timestamp: timestamp
    };
    localStorage[id] = JSON.stringify(intentData);
  }
}, false);

window.addEventListener("storage", function(e) {
  // Intent messages are stored in localStorage as a synch mechanism.
  // This is a dirty hack.
  var data = JSON.parse(e.newValue);
  if(data && data.intent && data.state == "response") {
    localStorage.removeItem[data.intent._id];
    var channel = responseChannel[data.intent._id];
    if(!!channel) {
      channel.postMessage(
        { intent: data.intent },
        [],
        "*");
    }
  }
});

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
