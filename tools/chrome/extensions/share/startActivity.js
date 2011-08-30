var port = chrome.extension.connect();
port.onMessage.addListener(function(intent) {
  // There has been a share intent calle
  var startActivityScript = document.createElement("script");
  var sa = "var intentObj = new Intent();";
  sa += "intentObj.action = '" + intent.action  + "';";
  sa += "intentObj.type = '" + intent.type  + "';";
  sa += "intentObj.data = '" + intent.data  + "';";
  sa += "window.navigator.startActivity(intentObj);"
  startActivityScript.textContent = sa;
  document.head.appendChild(startActivityScript);
});

var intentsScript = document.createElement("script");
intentsScript.src = "https://0.0.0.0:8080/webintents.js";

document.head.appendChild(intentsScript);
