var setText = function(obj, text) {
  if(!!obj.textContent) {
    obj.textContent = text;
  }
  else {
    obj.innerText = text; 
  }
};
