var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

function num(v) {
	return parseInt(v, 10);
}
function getRandomNum(min, max) {
	return num(Math.random() * (max - min) + min);
}

var MosaicSchema = new mongoose.Schema({
	name: { type: String, default: "My Mosaic" },
	path: String,
	userID: String,
	date: { type: Date, default: Date.now },
	views: { type: Number, default: 0 },
	votes: { type: Number, default: 0 }
});

MosaicSchema.methods = {
	addVote: function (cb) {
  		this.votes++;
  		this.save(cb);
	},
	addView: function (cb) {
  		this.views++;
  		this.save(cb);
	}
};

MosaicSchema.statics = {
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

exports.mosaicModel = mongoose.model('Mosaic', MosaicSchema);