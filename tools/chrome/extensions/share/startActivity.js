chrome.extension.onRequest.addListener(function(intent) {
  window.navigator.startActivity(intent);
});
<<<<<<< HEAD
=======

var intentsScript = document.createElement("script");
intentsScript.src = "https://127.0.0.1:8080/webintents.js";

document.head.appendChild(intentsScript);
>>>>>>> b8b342dbc75b18a4a93cbf5976952e3d68002e4c
