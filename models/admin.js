var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt');

var cryptPassword = function(password, callback) {
   bcrypt.genSalt(10, function(err, salt) {
		if (err) return callback(err);
		else {
			bcrypt.hash(password, salt, function(err, hash) {
			return callback(err, salt, hash);
		});
		}
  });
};

var AdminSchema = new mongoose.Schema({
		username: String,
		password: String,
		salt: String
	});

AdminSchema.statics = {
	authenticate: function(username, password, cb) {
		this.model('Admin').findOne({ username: username }, function (err, a) {
			if(err) throw "no user";

			if(!a) {
				cb(false);
				return;
			}

			bcrypt.hash(password, a.salt, function(err, hash) {
				if(err) throw err;
				var encPass = hash;

				cb(encPass === a.password);
			});
		});
	},
	exists: function(username, cb) {
		this.model('Admin').findOne({username: username}, function (err, a) {
			if(err) throw err;
			cb(!!a);
		});
	},
	addNew: function(admin, cb) {
		this.model('Admin').create(admin, cb);
	}
};

exports.adminModel = mongoose.model('Admin', AdminSchema);