var bcrypt = require('bcrypt');
var db = require('./models/database').DataBase;

var createPassword = function(password, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return callback(err);
		else {
			bcrypt.hash(password, salt, function(err, hash) {
			return callback(err, salt, hash);
		});
		}
	});
};

var username = process.argv[2];
var password = process.argv[3];

if (process.argv.length === 5) {
	console.log('auth', username, password);
	db.admins.authenticate(username, password, function(success) {
		console.log(success);
		process.exit();
	});
}
else {
	createPassword(password, function(err, salt, hash) {
		if(err) throw err;

		var admin = {
			username: username,
			password: hash,
			salt: salt
		}
		db.admins.addNew(admin, function(err, adm) {
			if(err) throw err;

			console.log('created', adm);

			process.exit();
		});
	});
}