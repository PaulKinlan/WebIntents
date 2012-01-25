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

  var intent;

  var setText = function(obj, text) {
    obj.appendChild(document.createTextNode(text));
  };

  this.setIntent = function(i) {
    intent = i;
  }

  this.getIntent = function() {
    return intent;
  }

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

  var launch = function(intent, disposition, href) { 
    return function(e) {
      if(!!e.preventDefault) 
        e.preventDefault();
      else
        e.returnValue = false;

      var intentStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(intent)))).replace(/=/g, "_");

      if(!!intent && !!intent._callback == false) {
        // There is no callback so remove any reference to the intent.
        localStorage.removeItem(intent._id);
      }

      if(disposition == "inline") {
        var iframe = document.getElementById("inline");
        iframe.contentWindow.name = intentStr;
        iframe.src= href;
        iframe.style.display = "block";
      }
      else {
        window.name = "";
        window.open(href, intentStr);
      }

      return false;
    };
  };

  var renderAction = function(action, intent) {
    var actionElement = document.createElement("li");
    var actionLink = document.createElement("a");
    var icon = document.createElement("img");
    var domain = document.createElement("span");

    icon.src = action.icon;
    icon.style.float = "left";

    actionLink.href = action.url;
    actionLink.target = "_blank";
    setText(actionLink, action.title);
    
    if(!!intent)
      attachEventListener(actionElement, "click", launch(intent, action.disposition, action.url), false);
    
    setText(domain, action.domain || "Unknown domain");
    
    actionElement.style.clear = "both";
    actionElement.style.listStyle = "none";
    actionElement.appendChild(icon);
    actionElement.appendChild(actionLink);
    actionElement.appendChild(domain);

    return actionElement;
  };
})();
