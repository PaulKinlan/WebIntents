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

var IntentController = new (function() { 
  var setText = function(obj, text) {
    if(!!obj.textContent) {
      obj.textContent = text;
    }
    else {
      obj.innerText = text; 
    }
  };

  this.renderActionContainer = function (action, root) {
    var header = document.createElement("h2");
    setText(header, action.key);
    var collection = document.createElement("ul");

    root.appendChild(header);
    root.appendChild(collection);

    return collection; 
  };
  
  this.renderActions = function(actions, intent, root) {
    root = root || document.getElementById("actions");
    var action;
    for(var i = 0; action = actions[i]; i++) {
      var actionElement = renderAction(action, intent);
      root.appendChild(actionElement); 
    } 
  };

  var launch = function(intent) { 
    return function(e) {
      if(!!e.preventDefault) 
        e.preventDefault();
      else
        e.returnValue = false;

      var intentStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(intent)))).replace(/=/g, "_");

      var defaultIntent = Intents.getDefault(intent.action);
      if(!!defaultIntent && defaultIntent.url == intent.url) {
        // Open in current window.
        var w = window.open((e.srcElement || e.target).href, intentStr);
      }
      else {
        window.name = "";
        window.open((e.srcElement || e.target).href, intentStr);
        window.close();
      }


      return false;
    };
  };

  var setDefault = function(intent) {
    return function(e) {
      if(!!e.preventDefault) 
        e.preventDefault();
      else
        e.returnValue = false;

      e.target.src = "/images/star.png"; 
      Intents.setDefault(intent); 

      return false;
    };
  };

  var renderAction = function(action, intent) {
    var actionElement = document.createElement("li");
    var actionLink = document.createElement("a");
    var icon = document.createElement("img");
    var domain = document.createElement("span");
    var isDefault = document.createElement("img");

    icon.src = action.icon;

    actionLink.href = action.url;
    actionLink.target = "_blank";
    setText(actionLink, action.title);
    attachEventListener(actionLink, "click", launch(intent), false);
 
    isDefault.className = "star";
    isDefault.src = "/images/unstar.png";
    attachEventListener(isDefault, "click", setDefault(action), false);

    setText(domain, action.domain || "Unknown domain");
    
    actionElement.appendChild(icon);
    actionElement.appendChild(actionLink);
    actionElement.appendChild(domain);
    actionElement.appendChild(isDefault)

    return actionElement;
  };
})();
