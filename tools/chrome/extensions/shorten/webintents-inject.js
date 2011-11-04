(function() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4 || xhr.status != 200) return;
    var script = document.createElement("script");
    script.textContent = xhr.responseText;
    document.head.appendChild(script);
  };
  xhr.open("GET", chrome.extension.getURL('/webintents.js'), true);
  xhr.send();
})();
