(function(window, document) {
	/**
	 * Function.bind Polyfill for ECMAScript 5 Support
	 * Kangax's bind with Broofa's arg optimization.
	 * http://www.broofa.com/Tools/JSLitmus/tests/PrototypeBind.html
	 */
	if (typeof Function.prototype.bind !== "function") {
	    Function.prototype.bind = function() {
	        var slice = Array.prototype.slice;
	        return function(context) {
	            var fn = this,
	                args = slice.call(arguments, 1);
	            if (args.length) {
	                return function() {
	                    return arguments.length
	                        ? fn.apply(context, args.concat(slice.call(arguments)))
	                        : fn.apply(context, args);
	                };
	            }
	            return function() {
	                return arguments.length
	                    ? fn.apply(context, arguments)
	                    : fn.call(context);
	            };
	        };
	    };
	}

	function num(v) {
		return parseInt(v, 10);
	}
	function getRandomNum(min, max) {
		return num(Math.random() * (max - min) + min);
	}
	function getAveRGB (data) {
		var r = [],
		  	g = [],
		  	b = [];

		for(var i = 0; i< data.length; i += 4) {
			r.push(data[i]);
			g.push(data[i+1]);
			b.push(data[i + 2]);
		}

		return [num(arraverage(r)), num(arraverage(g)), num(arraverage(b))];
	}
	function arraverage (arr) {
		var sum = 0;
		for(var i = 0; i < arr.length; i++) {
			sum += arr[i]; 
		}
		return sum/arr.length;
	}
	
	// Credit to ColorThief for this CanvasImage Class
	var CanvasImage = window.CanvasImage = function(img, w, h) {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.image = img;

		this.setDimensions(w || img.width, h || img.height);
	};

	CanvasImage.prototype.draw = function() {
    	this.context.drawImage(this.image, 0, 0, this.width, this.height);
	};

	CanvasImage.prototype.setDimensions = function(w, h) {
		this.width = this.canvas.width = w;
		this.height = this.canvas.height = h;
		this.draw();
	};

	CanvasImage.prototype.update = function (imageData, x, y) {
		if (typeof x === 'undefined') {
			x = 0;
			y = 0;
		}
	    this.context.putImageData(imageData, x, y);
	};

	CanvasImage.prototype.getImageData = function (x, y, w, h) {
		if (typeof x === 'undefined') {
			x = 0;
			y = 0;
			w = this.width;
			h = this.height;
		}
	    return this.context.getImageData(x, y, w, h);
	};


	var MosaicJS = window.MosaicJS = function(opts) { 
		this.subImages = [];
		this.mainImage = null;
	};

	MosaicJS.prototype.setMainImage = function(img) {
		this.mainImage = new CanvasImage(img);
		var ss = parseInt(this.mainImage.width * .01, 10);
		this.setRatios(ss, 5);
	};

	MosaicJS.prototype.setRatios = function (ss, sr) {
		this.sampleRatio = sr;
		this.sampleSize = ss;
		for(var i = 0; i < this.subImages.length; i++) {
			var si = this.subimages[i];
			si.setDimensions(ss*sr, ss*sr);
		}
	};

	MosaicJS.prototype.setSubImages = function(imgs) {
		var s = this.sampleRatio * this.sampleSize;
		this.subImages = [];
		for (var x = 0; x < imgs.length; x++) {
			var i = new CanvasImage(imgs[x], s, s);
			this.addSubImage(i);
		}
	};

	MosaicJS.prototype.addSubImage = function(img) {
		this.subImages.push(img);
	};

	MosaicJS.prototype.createMosaic = function(cb) {
		var mi = this.mainImage,
			w = mi.width,
			h = mi.height,
			q = this.sampleSize,
			sr = this.sampleRatio;

		var output = document.createElement('canvas');
		output.width = mi.width * sr;
		output.height = mi.height * sr;
		var outCtx = output.getContext('2d');


		var outputData = outCtx.createImageData(output.width, output.height);
		var inputData = mi.getImageData();
		var subImageData = this.subImages.map(function(si) { return si.getImageData(); });
		this.subImageData = subImageData;
		this.output = outputData;
		this.outCtx = outCtx;
		
		var worker = new Worker('/js/mosaicworker.js');
		worker.postMessage({
			output: outputData,
			input: inputData,
			subImageData: subImageData,
			sampleRatio: sr,
			sampleSize: q
		});

		worker.addEventListener('message', function(e) {
			var result = e.data.result;
			outCtx.putImageData(result, 0, 0);
			cb(output.toDataURL());
		});
	};

	MosaicJS.prototype.createMosaic_legacy = function(cb) {
		var mi = this.mainImage,
			w = mi.width,
			h = mi.height,
			q = this.quality,
			fill = (this.subImages.length > 0 ? this.fillChunk_Advanced : this.fillChunk_Simple).bind(this);

		for (var x = 0; x < w; x += q) {
			for (var y = 0; y < h; y += q) {
				var chunk = mi.getImageData(x, y, q, q);
				var rgb = getAveRGB(chunk.data);
				fill(rgb, x, y);
			}
		}
		return mi.canvas.toDataURL();
	};

})(window, document);