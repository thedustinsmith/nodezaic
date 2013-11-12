// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('SrhQM74r99G256SQ');

var express = require('express'),
    mongoose = require('./mongoose'),
    http = require('http'),
    path = require('path');

var isProduction = (process.env.NODE_ENV === 'production'),
    port = (isProduction ? 80 : 8000);

var app = express();
require('./routes')(app);

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.compress());
  app.use(app.router);
  app.use(express.staticCache());
  app.use(express.static(path.join(__dirname, 'public')));
});

var dustin = require('./routes/dustin');
app.get('/dustin', dustin.index);

http.createServer(app).listen(app.get('port'), function(){
  // if run as root, downgrade to the owner of this file
  if(isProduction) {
    if (process.getuid() === 0) {
      require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
        process.setuid(stats.uid);
      });
    }
  }
  console.log("Express server listening on port " + app.get('port'));
});
