chrome.extension.onRequest.addListener(function(intent) {
    var script = "";
    script += "var i = new Intent('" + intent.action + "'");
    script += ",'" + intent.type + "',";
    script += ", JSON.parse('" + JSON.stringify(intent.data) + "'));";
    script += "window.navigator.startActivity(i);";
    var scriptElement = document.createElement(scriptElement);
    scriptElement.innerText = script;
    document.head.appendChild(scriptElement);
});
