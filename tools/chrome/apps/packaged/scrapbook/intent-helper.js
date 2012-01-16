
var ObjectType = {
  /* 
   * Object types denote the wrapper type, these are distinct. 
   */
  Other: -1,
  Blob : 0,
  Url : 1,
  DataURI : 2,
  TypedArray: 3,
  File: 4
};

var IntentHelper = new (function() {
  this.getObjectType = function(data) {
    /*
     * Returns ObjectType.Blob, ObjectType.Url, ObjectType.DataURI, ObjectType.Other
     */
    if(data instanceof window.Blob) return ObjectType.Blob;
    if(data instanceof window.File) return ObjectType.File;
    if(data && data.buffer && data.buffer instanceof window.ArrayBuffer) return ObjectType.TypedArray;
    if(data instanceof String) {
      if(data.substring(0,4) == "data") return ObjectType.DataURI;
      if(data.substring(0,4) == "http") return ObjectType.Url;
    }
      
    return ObjectType.Other;
  };  
})();
