var Scrappy = new (function() {
  this.save = function(data, name, type) {
    filer.init({persistent: false, size: size}, function(fs) {
      filer.write(name, {data: data, type: type}, function(fileEntry) {
        fileList.addFile(fileEntry);
      }, function(e) {console.log(e)});
    }, function(e) { console.log(e)});
  };

  this.startShare = function() {
    var file = fileList.file;
    var intent = new WebKitIntent("http://webintents.org/share", file.type, file);
    window.navigator.webkitStartActivity(intent);
  };

  this.startSave = function() {
    var file = fileList.file;
    var intent = new WebKitIntent("http://webintents.org/save", file.type, file);
    window.navigator.webkitStartActivity(intent);
  };

  this.startEdit = function() {
    var file = fileList.file;
    var intent = new WebKitIntent("http://webintents.org/edit", file.type, file);
    window.navigator.webkitStartActivity(intent);
  };

  this.startPick = function(callback) {
    var intent = new WebKitIntent("http://webintents.org/pick", "*");
    window.navigator.webkitStartActivity(intent, callback);
  };
})();

var FileListModel = function(files) {
  var self = this;
  this.file = undefined;
  this.selectFile = function(entry) {
    var url = entry.toURL();
    entry.file(function(f) {
      self.fileEntry = entry;
      self.file = f;
      if(f.type.substring(0,5) == "image") {
        $("#viewer")[0].src = url; 
      }
    });
  };
  this.files = ko.observableArray(files);
  this.addFile = function(file) {
    this.files.push(file);
  }
};

var fileList;
var filer = new Filer();
var size = 1024 * 1024 * 1204;
filer.init({persistent: false, size: size}, function(fs) {
  filer.ls('/', function(entries) {
    fileList = new FileListModel(entries);
    ko.applyBindings(fileList);
  });
});
