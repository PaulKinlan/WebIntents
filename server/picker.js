window.addEventListener("load", function() {
  // Tell the opener that we are ready for business
  window.opener.postMessage({ "request": "ready" }, "*"); 
}, false);
