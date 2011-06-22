attachEventListener(window, "load", function() {
  console.log(window.name); 
  var obj = localStorage[window.name];
  //localStorage.removeItem(window.name);

  var data = JSON.parse(obj);
  data.request = "startActivity";
  data.origin = window.name;  
  // Send a message to itself, mainly for webkit. 
  window.postMessage(JSON.stringify(data), "*");
}, false);
