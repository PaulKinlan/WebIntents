var attachEventListener = function(obj, type, func, capture) {
  if(!!obj.addEventListener) {
    obj.addEventListener(type, func, capture);
  }
  else if(!!obj.attachEvent) {
    obj.attachEvent("on" + type, func);
  }
};
