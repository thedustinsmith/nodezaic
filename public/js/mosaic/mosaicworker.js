importScripts("workerCanvas.js");
importScripts("../util.js")

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

function processJob(job) {
	var input = job.input,
		output = job.output,
		w = job.width,
		h = job.height,
		sampleRatio = job.sampleRatio,
		ss = job.sampleSize,
		xStart = job.x,
		yStart = job.y;

	var wc = new WorkerCanvas(input, output);

	for (var x = xStart; x < w; x += ss) {
		for (var y = yStart; y < h; y += ss) {
			var chunk = wc.getImageData(x, y, ss, ss);
			var rgb = getAveRGB(chunk.data);
			//self.postMessage({ action: 'log', more: rgb });
			var subImageData = getSubImageData();
			var mod = adjustSubImageData(rgb, subImageData);
			wc.putImageData(mod, x * sampleRatio, y * sampleRatio);
		}
	}

	self.postMessage({
		action: 'jobOutput',
		job: job,
		output: output
	});
}

self.addEventListener('message', function(e) {
	var subImageData = e.data.subImageData;

	self.subImages = subImageData;

	var job = e.data.job;
	processJob(job);
});

function debug(m) {
	self.postMessage({
		action: 'debug',
		message: m
	})
}