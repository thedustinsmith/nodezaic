var db = require('../models'),
	imageUtility = require("../utility/imageUtility");

module.exports = function (app) {

	app.get('/mosaics', function (req, res) {
	    db.mosaicModel.find().exec(function (err, results) {
	        if (err) throw err;

	        var all = results.sort(function() {return 0.5 - Math.random()});

	        res.render('listing', { results: all, title: 'Generated Mosaics', isAll: true })
	    });
	});

	app.get('mosaics/mine', function (req, res) {
		if(!req.cookies.uid) {
			res.render('listing', {error: true, title: 'My Mosaics'});
			return;
		}
	    db.mosaicModel.find({ userID: req.cookies.uid }).exec(function (err, results) {
	        if (err) throw err;
	        res.render('listing', { results: results, title: 'My Mosaics' })
	    });
	});

	app.get('/mosaics/:id', function(req, res) {
		var mosaicID = req.param('id');
		db.mosaicModel.getByID(mosaicID, function(err, mosaic) {
			if(err) throw err;

			mosaic.views = mosaic.views + 1;
			mosaic.save();
			res.render('image-view', mosaic);
		})
	});

	app.get('/mosaics/random', function (req, res) {
		db.mosaicModel.getRandom(function(mosaic) {
			mosaic.views = mosaic.views + 1;
			mosaic.save();
			res.render('image-view', mosaic);
		});
	});

	app.post('/mosaics', function(req, res){
		var imgData = req.body.imgData,
			name = req.body.name,
			userID = req.cookies.uid;
		
		if(!userID) {
			db.userModel.addNew({}, function(err, u) {
				if(err) throw err;
				userID = u.id;
				saveImg();
			});
		}
		else {
			saveImg();
		}
		
		function saveImg() {
			imageUtility.save(imgData, function(path) {
				var mosaic = { name: name, userID: userID, path: path };
				db.mosaicModel.addNew(mosaic, function(err, m) {
					if (err) throw err;
					res.cookie("uid", userID);
					res.json({ success: true, mosaic: m });
				});
			});
		}
	});
}

