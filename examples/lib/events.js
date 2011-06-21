if(!!window.addEventListener == false) {
  window.addEventListener = function(type, func, capture) {
    this.attachEvent("on" + type, func);
  }
}
