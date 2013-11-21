function num(v) {
		return parseInt(v, 10);
}
function arraverage (arr) {
	var sum = 0;
	for(var i = 0; i < arr.length; i++) {
		sum += arr[i]; 
	}
	return sum/arr.length;
}
function getRandomNum(min, max) {
	return num(Math.random() * (max - min) + min);
}

var WorkerCanvas = function(input) {
	//this.input = input;
	if (this.input) {
		this.data = input.data;
		this.width = input.width;
		this.height = input.height;
	}
};

WorkerCanvas.prototype.setDimensions = function (w, h) {
	this.width = w;
	this.height = h;
	this.buffer = new ArrayBuffer(w * 4 * h);
	this.data = new Uint8Array(this.buffer);
};

WorkerCanvas.prototype.getImageData = function (x, y, w, h) {
	var	d = this.data,
		tw = this.width,
		th = this.height,
		rw = tw * 4;

	var buff = new ArrayBuffer(w * 4 * h);
	var ret = new Uint8Array(buff);
	var ix = 0;
	for (var r = y; r < (y + h); r++) {
		var start = (x * 4) + (r * rw);
		var end = ((x + w) * 4) + (r * rw) + 4;
		for(var i = start; i < end; i++) {
			ret[0] = d[i];
		}
	}
	return ret;
};

WorkerCanvas.prototype.putImageData = function (input, x, y) {
	var iw = input.width,
		ih = input.height,
		rw = this.width * 4,
		d = this.data;

	var inIx = 0;
	for (var row = y; row < (y + ih); row++) {
		var rowStart = row * rw;
		var colStart = (x * 4) + rowStart;
		var colEnd = colStart + (iw * 4);

		for (var ix = colStart; ix < colEnd; ix++) {
			d[ix] = input.data[inIx];
			inIx++;
		}
	}
};

WorkerCanvas.prototype.getAverageRGB = function (x, y, w, h) {
	var r = [],
	  	g = [],
	  	b = [],
	  	data = this.getImageData(x, y, w, h);

	for(var i = 0; i< data.length; i += 4) {
		r.push(data[i]);
		g.push(data[i+1]);
		b.push(data[i + 2]);
	}

	return [num(arraverage(r)), num(arraverage(g)), num(arraverage(b))];
};

WorkerCanvas.prototype.applyFilter = function (r,g,b) {
	var pix = this.data;
	for (var j = 0; j<pix.length; j += 4){ 
		var or = pix[j],
			og = pix[j+1],
			ob = pix[j+2];

		var rdelt = r - or, //or - r,
			gdelt = g - og, //og - g,
			bdelt = b - ob; //ob - b;

		pix[j] = r + (rdelt / 1.5);
		pix[j + 1] = g + (gdelt / 1.5);
		pix[j + 2] = b + (bdelt / 1.5);
	}
};

function bufferOutput (rgb, x, y) {
	var ss = self.sampleRatio * self.sampleSize;
	if (self.subImages.length) {
		var advData = fillChunk_Advanced(rgb);
		_putImageData(advData, x, y);
	}
	else {
		throw 'simp data error';
		var simpData = outCtx.createImageData(ss, ss);
		for(var i = 0; i < simpData.data.length; i+=4) {
			simpData.data[i] = r[0];
			simpData.data[i+1] = r[1];
			simpData.data[i+2] = r[2];
			simpData.data[i+3] = 255;
		}
		_putImageData(output, simpData, x, y);
	}
};

function fillChunk_Advanced (rgb) {
	var or = rgb[0],
		og = rgb[1],
		ob = rgb[2],
		imgIx = getRandomNum(0, self.subImages.length),
		subImg = self.subImages[imgIx]; 

	var pixBuff = new ArrayBuffer(subImg.data.length);
  	var pix = new Uint8Array(pixBuff);
  	pix.set(subImg.data, 0, subImg.data.length);
	for(var j = 0; j<pix.length; j += 4){ 
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

	return {
		width: subImg.width,
		height: subImg.height,
		data: pix
	}
};


/*

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
function _putImageData (inData, xPos, yPos) {
	var inW = inData.width,
		inH = inData.height,
		rowWidth = self.output.width * 4;

	var inIx = 0;
	for (var row = yPos; row < (yPos + inH); row++) {
		var rowStart = row * rowWidth;
		var colStart = (xPos * 4) + rowStart;
		var colEnd = colStart + (inW * 4);

		for (var ix = colStart; ix < colEnd; ix++) {
			self.output.data[ix] = inData.data[inIx];
			inIx++;
		}
	}
}
*/