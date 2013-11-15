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
	//var debug = '******************** before *********************';
	//debug += JSON.stringify(self.output);
	//throw debug;
	for (var row = yPos; row < (yPos + inH); row++) {
		var rowStart = row * rowWidth;
		var colStart = (xPos * 4) + rowStart;
		var colEnd = colStart + (inW * 4);

		for (var ix = colStart; ix < colEnd; ix++) {
			self.output.data[ix] = inData.data[inIx];
			inIx++;
		}
	}
	//debug += '********************** after ************************';
	//debug += JSON.stringify(self.output);
	//throw debug;
/*
	var inIndex = 0;
	for (var row = yPos; row < yPos + inH; row++) {
		var start = (xPos * 4) + (row * rowWidth);
		var end = ((xPos + inW) * 4) + (row * rowWidth) + 4;
		
		for (var i = start; i < end; i++) {
			this.output.data[i] = inData.data[inIndex];
			inIndex++;
		}
	}
	*/
}

function bufferOutput (rgb, x, y) {
	var ss = self.sampleRatio * self.sampleSize;
	if (true) {//(self.subImages.length) {
		var advData = fillChunk_Advanced(rgb);

		_putImageData(advData, x, y);
		//this.outCtx.putImageData(advData, x, y);
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
		subImg = self.subImages.slice(0, 1); //[imgIx]; // why didn't this work?

	var pix = subImg.data;
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

	return subImg;
};


self.addEventListener('message', function(e) {
	var input = e.data.input,
		output = e.data.output,
		subImageData = e.data.subImageData,
		w = input.width,
		h = input.height,
		sr = e.data.sampleRatio,
		q = e.data.sampleSize;

	self.output = output
	self.sampleRatio = sr;
	self.sampleSize = q;
	self.subImages = subImageData;

	for (var x = 0; x < w; x += q) {
		for (var y = 0; y < h; y += q) {
			var chunk = _getImageData(input, x, y, q, q);
			var rgb = getAveRGB(chunk);
			bufferOutput(rgb, x * sr, y * sr);
		}
	}

	self.postMessage({
		result: output
	});
	//return output.toDataURL();
});