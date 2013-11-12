var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
		facebookID: String,
		googleID: String
	});

UserSchema.methods = {
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

UserSchema.statics = {
	getByID: function (id, cb) {
		return this.model('User').findOne({ _id: id }, cb);
	},
	addNew: function(user, cb) {
		this.model('User').create(user, cb);
	}
};

exports.userModel = mongoose.model('User', UserSchema);