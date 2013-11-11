// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('SrhQM74r99G256SQ');

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , mosaic = require('./routes/mosaic')
  , imageStore = require('./routes/imagestore')
  , social = require('./routes/social')
  , team = require('./routes/team')
  , about = require('./routes/about')
  , examples = require('./routes/examples')
  , http = require('http')
  , path = require('path');

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var port = (isProduction ? 80 : 8000);

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
  app.use(express.staticCache());
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.index);
app.get('/team', team.index);
app.get('/about', about.index);
app.get('/examples', examples.index);

app.get('/mosaics', mosaic.listall);
app.post('/mosaics', mosaic.save);
app.get('/mosaics/mine', mosaic.listbyuser);
app.get('/mosaics/random', mosaic.random);
app.get('/mosaics/:id', mosaic.view);

app.post('/imagestore', imageStore.upload);
app.get('/imagestore', imageStore.getSubImages);
app.get('/imagestore/:count', imageStore.getSubImages);
app.get('/proxy-image/:imageUrl', imageStore.proxy);

var admin = require('./routes/admin');
app.get('/admin', admin.list);
app.get('/admin/login', admin.login);
app.post('/admin/login', admin.loginPost);
app.get('/adminRemove/:name', admin.remove);
app.get('/adminMosaic', admin.listMosaic)
app.get('/adminRemoveMosaic/:id', admin.removeMosaic)

app.get('/socialcallback', social.callback);

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
