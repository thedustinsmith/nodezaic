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

	MosaicJS.prototype.fillChunk_Advanced = function(rgb, x, y) {
		var or = rgb[0],
			og = rgb[1],
			ob = rgb[2],
			imgIx = getRandomNum(0, this.subImages.length),
			subImg = this.subImages[imgIx];

		var sData = subImg.getImageData();
		var pix = sData.data;
		for(var j = 0; j<pix.length; j+=4){ 
			var r = pix[j],
				g = pix[j+1],
				b = pix[j+2];

			var rdelt = or - r,
				gdelt = og - g,
				bdelt = ob - b;

			pix[j] = r + (rdelt / 1.5);
			pix[j + 1] = g + (gdelt / 1.5);
			pix[j + 2] = b + (bdelt / 1.5);
		}

		return sData;
	};

	MosaicJS.prototype.fillChunk_Simple = function(rgb, x, y) {
		var q = this.sampleRatio * this.sampleSize,
			color = 'rgb(' + rgb.join(',') + ')';


		this.mainImage.context.fillStyle = color;
		this.mainImage.context.fillRect(x, y, q, q);
	};

	function _getImageData(data, xPos, yPos, w, h) {
		var ret = [],
			dWidth = data.width,
			dHeight = data.height,
			imgdata = data.data,
			rowWidth = dWidth * 4;

		for (var row = yPos; row < (yPos + h); row++) {
			var start = (xPos * 4) + (row * rowWidth);
			var end = ((xPos + w) * 4) + (row * rowWidth) + 4;
			for(var i = start; i < end; i++) {
				ret.push(imgdata[i]);
			}
		}
		return ret;
	}

	MosaicJS.prototype.bufferOutput = function (outCtx, rgb, x, y) {
		var ss = this.sampleRatio * this.sampleSize;
		if (this.subImages.length) {
			var advData = this.fillChunk_Advanced(rgb);
			outCtx.putImageData(advData, x, y);
		}
		else {
			var simpData = outCtx.createImageData(ss, ss);
			for(var i = 0; i < simpData.data.length; i+=4) {
				simpData.data[i] = r[0];
				simpData.data[i+1] = r[1];
				simpData.data[i+2] = r[2];
				simpData.data[i+3] = 255;
			}
			outCtx.putImageData(simpData, x, y);
		}
	};

	MosaicJS.prototype.createMosaic = function(cb) {
		var mi = this.mainImage,
			w = mi.width,
			h = mi.height,
			q = this.sampleSize,
			sr = this.sampleRatio,
			fill = (this.subImages.length > 0 ? this.fillChunk_Advanced : this.fillChunk_Simple).bind(this);

		var output = document.createElement('canvas');
		var outCtx = output.getContext('2d');
		output.width = mi.width * sr;
		output.height = mi.height * sr;

		var data = mi.getImageData();
		for (var x = 0; x < w; x += q) {
			for (var y = 0; y < h; y += q) {
				var chunk = _getImageData(data, x, y, q, q);
				var rgb = getAveRGB(chunk);
				this.bufferOutput(outCtx, rgb, x * sr, y * sr);
			}
		}

		return output.toDataURL();
	}

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