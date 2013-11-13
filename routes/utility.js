module.exports = function(app){
	app.get('/socialcallback', function(req, res){
		res.render('shared/socialcallback', {});
	});
};