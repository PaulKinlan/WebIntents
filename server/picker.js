attachEventListener(window, "load", function() {
  var obj = localStorage[window.name];
  localStorage.removeItem(window.name);

  var data = JSON.parse(obj);
  data.request = "startActivity";
  data.origin = window.name;  
  // Send a message to itself, mainly for webkit. 
  window.postMessage(JSON.stringify(data), "*");

  window.resizeTo(300,300);
}, false);
