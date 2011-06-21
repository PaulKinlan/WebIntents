addEventListener(window, "load", function() {
  // Tell the opener that we are ready for business
  window.opener.postMessage(JSON.stringify({ "request": "ready", "id": window.name }), "*"); 
}, false);
