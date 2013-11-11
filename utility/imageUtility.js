var fs = require("fs"),
	tmp = require("tmp");

exports.save = function(imageData, storeType, forceName, fileType, callback) {
	if (!callback && (typeof storeType === 'function')) {
		callback = storeType;
		storeType = 'mosaics';
	}
	else if (!callback && (typeof forceName ==='function')) {
		callback = forceName;
		forceName = '';
	}
	else if (!callback && (typeof fileType === 'function')) {
		callback = fileType;
		fileType = 'image/png';
	}

	if(!fileType) {
		fileType = 'image/png';
	}

	var b64Data = imageData.replace("data:" + fileType + ";base64,", "");
	var ext = '';
	switch(fileType) {
		case 'image/jpeg':
			ext ='.jpg';
			break;
		case 'image/jpg':
			ext = '.jpg';
			break;
		default: 
			ext ='.png';
			break;
	}

	var generateFileName = function(cb) {
		tmp.tmpName(function _tempNameGenerated(err, path) {
			if (err) throw err;
			var fileName = path.replace(/^.*[\\\/]/, '').replace("tmp-", "");
			cb(fileName);
		});
	}

	function saveImage(name) {
		var imgStorePath = "/img_store/" + storeType + "/" + name + ext;
		var path = require("path").resolve(__dirname + "/../public" + imgStorePath);
			
		fs.writeFile(path, b64Data, 'base64', function(err) {
			if (err) throw err;
			callback(imgStorePath);
		});
	}
		
	if (forceName) saveImage(forceName);
	else generateFileName(saveImage);
};

function getDirContents(path, cb) {
    fs.readdir(path, function (err, files) {
        var filteredFiles = [];
        files.forEach(function (f) {
            if (f.indexOf('.') !== 0) {
                filteredFiles.push(f);
            }
        });
        cb(filteredFiles);
    });
}

function getRandomNum(min, max) {
	return parseInt(Math.random() * (max - min) + min, 10);
}

exports.cleanDir = function(storeType, keep) {
	var path = require("path").resolve(__dirname + "/../public/img_store/" + storeType);
	getDirContents(path, function(files) {
		files = files.sort();
		if (files.length > keep) {
			for (var i = 0; i < (files.length - keep); i++) {
				var file = files[i];
				fs.unlink(path + "/" + file, function(err) {
					console.log("couldn't delete", file)
				});
			}
		}
	});
};

exports.getListing = function(storeType, count, cb) {
    if (!cb && typeof (count) === "function") {
        cb = count;
        count = null;
    }
    var path = require("path").resolve(__dirname + "/../public/img_store/" + storeType);
    getDirContents(path, function (files) {
        if (!count)
            count = files.length;
		var ret = [],
			end = files.length > count ? count : files.length;
		for (var i = 0; i< end; i++) {
			var file = files[i];
			ret.push('/img_store/' + storeType + '/' + file);
		}
		cb(ret);
	});
};