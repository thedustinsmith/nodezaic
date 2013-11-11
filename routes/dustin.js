exports.index = function (req, res) {
	res.render('dustin.jade');
};

exports.upload = function(req, res) {
	res.json(req);
};