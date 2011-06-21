if(!!window.addEventListener == false) {
  window.addEventListener = function(obj, type, func, capture) {
    obj.attachEvent("on" + type, func);
  }
}
