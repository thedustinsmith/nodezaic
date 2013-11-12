module.exports = function(app){
	app.get('/', function(req, res) {
		res.render('index')
	});

	app.get('/about', function(req, res) {
		res.render('about', { title: 'Team - Chalupa Batman' });
	});

	app.get('/team', function(req, res){
		res.render('team');
	});

	app.get('/examples', function(req, res){
		res.render('examples', { title: 'Mosaic Examples' });
	})

	require('./admin')(app);
	require('./mosaic')(app);
	require('./imagestore')(app);
	require('./utility')(app);
};
