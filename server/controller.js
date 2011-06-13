var IntentController = new (function() { 
  this.renderActionContainer = function (action, root) {
    var header = document.createElement("h2");
    header.innerText = action.key;
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
      e.preventDefault();
      var w = window.open(e.target.href, intent._id); 
           
      return false;
    };
  };

  var renderAction = function(action, intent) {
    var actionElement = document.createElement("li");
    var actionLink = document.createElement("a");

    actionLink.href = action.url;
    actionLink.target = "_blank";
    actionLink.innerText = action.title;
    actionLink.addEventListener("click", launch(intent), false);

    actionElement.appendChild(actionLink);
    return actionElement;
  };
})();
