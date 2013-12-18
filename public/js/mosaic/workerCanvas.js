var WorkerCanvas = function (inputData, outputData) {
	this.data = inputData;
	this.width = inputData.width;
	this.height = inputData.height;
	this.output = outputData;
};

WorkerCanvas.prototype.getImageData = function (x, y, w, h) {
	if(!x) {
		x = 0;
		y = 0;
		w = this.width;
		h = this.height;
	}

	var	d = this.data.data,
		tw = this.width,
		th = this.height,
		rw = tw * 4,
		buff = new ArrayBuffer(w * 4 * h),
		ret = new Uint8Array(buff),
		ix = 0;

	for (var r = y; r < (y + h); r++) {
		var start = (x * 4) + (r * rw);
		var end = start + (w * 4);
		for(var i = start; i < end; i++) {
			ret[ix] = d[i];
			ix++;
		}
	}

	return {
		data: ret,
		width: w,
		height: h
	};
};

WorkerCanvas.prototype.putImageData = function(inData, x, y) {
	var rowWidth = this.output.width * 4,
		inW = inData.width,
		inH = inData.height,
		inIx = 0;
	for (var row = y; row < (y + inH); row++) {
		var rowStart = row * rowWidth;
		var colStart = (x * 4) + rowStart;
		var colEnd = colStart + (inW * 4);

		for (var ix = colStart; ix < colEnd; ix++) {
			this.output.data[ix] = inData.data[inIx];
			inIx++;
		}
	}
};
