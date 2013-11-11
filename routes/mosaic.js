var fs = require("fs"),
	tmp = require("tmp"),
	mongoose = require('mongoose'),
	db = require('../models/database').DataBase,
	imageUtility = require("../utility/imageUtility");

exports.listall = function (req, res) {
    db.mosaics.find().exec(function (err, results) {
        if (err) throw err;

        var all = results.sort(function() {return 0.5 - Math.random()});

        res.render('listing', { results: all, title: 'Generated Mosaics', isAll: true })
    });
};

exports.listbyuser = function (req, res) {
	if(!req.cookies.uid) {
		res.render('listing', {error: true, title: 'My Mosaics'});
		return;
	}
    db.mosaics.find({ userID: req.cookies.uid }).exec(function (err, results) {
        if (err) throw err;
        res.render('listing', { results: results, title: 'My Mosaics' })
    });
};

exports.view = function(req, res) {
	var mosaicID = req.param('id');
	db.mosaics.getByID(mosaicID, function(err, mosaic) {
		if(err) throw err;

		mosaic.views = mosaic.views + 1;
		mosaic.save();
		res.render('image-view', mosaic);
	})
};

exports.random = function (req, res) {
	db.mosaics.getRandom(function(mosaic) {
		mosaic.views = mosaic.views + 1;
		mosaic.save();
		res.render('image-view', mosaic);
	});
};

exports.save = function(req, res){
	var imgData = req.body.imgData,
		name = req.body.name,
		userID = req.cookies.uid;
	
	if(!userID) {
		db.users.addNew({}, function(err, u) {
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
			db.mosaics.addNew(mosaic, function(err, m) {
				if (err) throw err;
				res.cookie("uid", userID);
				res.json({ success: true, mosaic: m });
			});
		});
	}
};

