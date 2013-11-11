var mongoose = require('mongoose/')
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


var DataBase = function() {
	var db = mongoose.connect('mongodb://localhost/mosaic');

	var mosaicModel = function() {
		var mosaicSchema = new mongoose.Schema({
			name: { type: String, default: "My Mosaic" },
			path: String,
			userID: String,
			date: { type: Date, default: Date.now },
			views: { type: Number, default: 0 },
			votes: { type: Number, default: 0 }
		});

		mosaicSchema.methods = {
			addVote: function (cb) {
		  		this.votes++;
		  		this.save(cb);
			},
			addView: function (cb) {
		  		this.views++;
		  		this.save(cb);
			}
		};

		function num(v) {
			return parseInt(v, 10);
		}
		function getRandomNum(min, max) {
			return num(Math.random() * (max - min) + min);
		}

		mosaicSchema.statics = {
			getByID: function (id, cb) {
				return this.model('Mosaic').findOne({ _id: id }, cb);
			},
			findByName: function (name, cb) {
				return this.model('Mosaic').find({ name: name }, cb);
			},
			findByUser: function(userID, cb) {
				return this.model('Mosaic').find({ userID: userID}, cb)
			},
			addNew: function(mosaic, cb) {
				this.model('Mosaic').create(mosaic, cb);
			},
			getRandom: function(cb) {
				var that = this;
				this.model('Mosaic').find(function(err, all) {
					if (err) throw err;
					var rand = getRandomNum(0, all.length);
					cb(all[rand]);
				});
			}
		};

		return mongoose.model('Mosaic', mosaicSchema);
	};

	var userModel = function() {
		var userSchema = new mongoose.Schema({
				facebookID: String,
				googleID: String
			});

		userSchema.methods = {
			getImages: function (cb) {
		  		this.model('Mosaic').findByUser(this.id, cb);
			},
			getVotes: function (cb) {
				this.model('Mosaic').findByUser(this.id, function(err, res) {
					if(err) cb(err);
					var count = 0;
					for(var i = 0; i < res.length; i++) {
						count += res.votes;
					}

					cb(null, count);
				});
			},
			getVotes: function (cb) {
				this.model('Mosaic').findByUser(this.id, function(err, res) {
					if(err) cb(err);
					var count = 0;
					for(var i = 0; i < res.length; i++) {
						count += res.views;
					}

					cb(null, count);
				});
			},
		};

		userSchema.statics = {
			getByID: function (id, cb) {
				return this.model('User').findOne({ _id: id }, cb);
			},
			addNew: function(user, cb) {
				this.model('User').create(user, cb);
			}
		};

		return mongoose.model('User', userSchema);
	};

	var adminModel = function() {
		var adminSchema = new mongoose.Schema({
				username: String,
				password: String,
				salt: String
			});

		adminSchema.statics = {
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

		return mongoose.model('Admin', adminSchema);
	};

	return { mosaics: new mosaicModel(), users: new userModel(), admins: new adminModel()  };
};

exports.DataBase = DataBase();