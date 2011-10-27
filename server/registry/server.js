var app = require("express").createServer();
var config = require("./config");

app.configure(function() {
  app.use(app.router);
  config.load(app.settings.env);
});

app.get("/intents.:format", function(req, res) {
  var action = req.query.action;
  var type = req.query.type;
  var format = req.params.format;

  res.send("");
});

app.post("/intent", function(req, res) {
  var url = req.query.url;
  res.send("");
});

app.listen(config.options.port, config.options.host || undefined);
