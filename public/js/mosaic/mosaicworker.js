importScripts("workerCanvas.js");
importScripts("../util.js")

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
}

function getSubImageData() {
	var imgIx = getRandomNum(0, self.subImages.length),
		subImg = self.subImages[imgIx];

	return {
		data: Uint8Copy(subImg.data),
		width: subImg.width,
		height: subImg.height
	};
}

function adjustSubImageData(rgb, subImgData) {
	var or = rgb[0],
		og = rgb[1],
		ob = rgb[2];
		
	for (var j = 0; j < subImgData.data.length; j += 4){ 
		var r = subImgData.data[j],
			g = subImgData.data[j+1],
			b = subImgData.data[j+2];

		var rdelt = or - r,
			gdelt = og - g,
			bdelt = ob - b;

		subImgData.data[j] = r + (rdelt / 1.5);
		subImgData.data[j + 1] = g + (gdelt / 1.5);
		subImgData.data[j + 2] = b + (bdelt / 1.5);

	}

	return subImgData;
}

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

	var wc = new WorkerCanvas(input, output);

	for (var x = 0; x < w; x += q) {
		for (var y = 0; y < h; y += q) {
			var chunk = wc.getImageData(x, y, q, q);
			var rgb = getAveRGB(chunk.data);
			//self.postMessage({ action: 'log', more: rgb });
			var subImageData = getSubImageData();
			var mod = adjustSubImageData(rgb, subImageData);
			wc.putImageData(mod, x * sr, y * sr);
		}
	}

	self.postMessage({
		result: output
	});
});