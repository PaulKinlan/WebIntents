window.addEventListener("load", function() {
  chrome.devtools.inspectedWindow.eval(
    "window.webkitIntent",
     function(result, isException) {
       if (isException || !!result == false) {
         console.log("The page does not have any intent data");
         var nodataEl = document.getElementById("nodata");
         nodataEl.style.display = "block";
       }
       else {
         var intentEl = document.getElementById("intent");
         intentEl.style.display = "block";
         console.log("The page has been invoked with the " + result + " intent");
         var action = document.getElementById("action");
         var type = document.getElementById("type");
         var data = document.getElementById("data");
         action.textContent = result.action;
         type.textContent = result.type;
         data.textContent = result.data;
       }
     }
    );    
}, false);
