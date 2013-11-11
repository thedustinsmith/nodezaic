var fs = require("fs"),
	tmp = require("tmp"),
	mongoose = require('mongoose'),
	db = require('../models/database').DataBase,
	imageUtility = require("../utility/imageUtility");

var validateLogin = function(req, res, cb) {
    var admin = req.cookies.admin_id;
    db.admins.exists(admin, function (success) {
        cb(success);
    });
};

exports.list = function (req, res) {
    validateLogin(req, res, function(loggedin) {
        if(!loggedin) {
            res.redirect('/admin/login');
            return;
        }
        var path = "/img_store/images/";
        imageUtility.getListing('images', function (files) {
            var results = [];
            for (var i = 0; i < files.length; i++){
                results.push({ 'path': files[i], 'name': files[i].replace(path, "")});
            }
            res.render('admin/admin', { results: results, location: 'sub' })
        });
    });
};

exports.remove = function (req, res) {
    validateLogin(req, res, function(loggedin) {
        if(!loggedin) {
            res.redirect('/admin/login');
            return;
        }
        var name = req.param('name');
        var path = require("path").resolve(__dirname + "/../public/img_store/images/" + name);
        fs.unlink(path, function (err) {
            console.log("couldn't delete", path)
        });

        res.json({success: true});
    });
};

exports.listMosaic = function (req, res) {
    validateLogin(req, res, function(loggedin) {
        if (!loggedin) {
            res.redirect('/admin/login');
            return;
        }

        db.mosaics.find().exec(function (err, results) {
            if (err) throw err;
            res.render('admin/admin', { results: results, location: 'mosaic' })
        });
    });
};

exports.removeMosaic = function (req, res) {
    validateLogin(req, res, function(loggedin) {
        if(!loggedin) {
            res.redirect('/admin/login');
            return;
        }
        var id = req.param('id');
        var name = db.mosaics.find({ _id: id }).name;
        db.mosaics.findOneAndRemove({ _id: id }, function (err, obj) {
            console.log('removing', obj);
        });

        var path = require("path").resolve(__dirname + "/../public/img_store/images/" + name);
        fs.unlink(path, function (err) {
            console.log("couldn't delete", path)
        });
        res.json({success: true});
    });
};

exports.login = function(req, res) {
    res.render('admin/login', {});
};

exports.loginPost = function(req, res) {
    var username = req.body.username, 
        password = req.body.password;

    db.admins.authenticate(username, password, function(success) { 
        if (success) {
          res.cookie('admin_id', username);
          res.redirect('/admin');
        }
        else {
          res.redirect('/admin?failed=true');
        }
    });
};