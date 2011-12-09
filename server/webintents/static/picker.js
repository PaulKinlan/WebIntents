/*
   Copyright 2011 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var decodeNameTransport = function(str) {
  try {
    return JSON.parse(window.atob(str.replace(/_/g, "=")));
  } catch (e) {
    return '';
  }
};

attachEventListener(window, "load", function() {
  var intent = decodeNameTransport(window.name);   
  
  data = {};
  data.request = "startActivity";
  data.origin = window.name;
  data.intent = intent;

  // Send a message to itself, mainly for webkit. 
  window.postMessage(JSON.stringify(data), window.location.protocol + "//" + window.location.host);

  var suggestions = document.getElementById("suggestions");
  suggestions.src = "//registry.webintents.org/suggestions.html?action=" + intent.action + "&type=" + intent.type;

  window.resizeTo(300,300);
}, false);
