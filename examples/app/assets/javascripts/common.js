var setText = function(obj, text) {
  if(typeof(obj.textContent) !== 'undefined') {
    obj.textContent = text;
  }
  else {
    obj.innerText = text; 
  }
};
