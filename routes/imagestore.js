var imageUtility = require("../utility/imageUtility"),
	url = require('url'),
	http = require('http');

module.exports = function(app) {
	app.post('/imagestore', function(req, res) {
		var imgData = req.body.imgData,
			name = req.body.name,
			fileType = req.body.fileType;

		if (!name) {
			name = new Date().getTime().toString();
		}
		if (!fileType) {
			fileType = 'image/png';
		}

		imageUtility.cleanDir('images', 100);
		imageUtility.save(imgData, 'images', name, fileType, function(path) {
			return res.json({path: path});
		});
	});

	app.get('/imagestore/:count', function (req, res) {
		var count = req.param('count');
		if (!count) {
			count = 25;
		}

		imageUtility.getListing('images', count, function(files) {
			res.json(files);	
		})
	});

	app.get('/imagestore/proxy-image/:imageUrl', function (req, res) {
	 	var imgUrl = req.params.imageUrl,
	 		filename = url.parse(imgUrl).pathname.split("/").pop();

		var getReq = http.request(imgUrl);
	  	getReq.addListener('response', function(proxyResponse){
		    var byteIndex = 0,
		    	contentLength = parseInt(proxyResponse.headers["content-length"]),
		    	body = new Buffer(contentLength);
		   
		    proxyResponse.setEncoding('binary');
		    proxyResponse.addListener('data', function(chunk){
				body.write(chunk, byteIndex, "binary");
				byteIndex += chunk.length;
		    });
		    proxyResponse.addListener('end', function(){
				res.contentType(filename);
				res.send(body);
		    });
	  	});
	  	getReq.end();
	});
};