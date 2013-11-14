var env = require('./environment.json');

exports.currentConfiguration = function() {
	var nodeEnv = process.env.NODE_ENV || 'development';
	return env[nodeEnv] || $.noop;
};