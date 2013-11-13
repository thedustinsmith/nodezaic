var express = require('express'),
    mongoose = require('./mongoose'),
    http = require('http'),
    path = require('path');

var isProduction = (process.env.NODE_ENV === 'production'),
    port = (isProduction ? 5678 : 8000);

var app = express();

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
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
});


require('./routes')(app);

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
