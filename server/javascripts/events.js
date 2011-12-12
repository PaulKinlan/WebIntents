var attachEventListener = function(obj, type, func, capture) {
  var objs = obj instanceof Array  || obj instanceof NodeList ? obj : [obj];

  for(var i in objs) {
    if(!!objs[i].addEventListener) {
      objs[i].addEventListener(type, func, capture);
    }
    else if(!!objs[i].attachEvent) {
      objs[i].attachEvent("on" + type, func);
    }
  }
};
