(function(window, document, $) {

if(!window.URL) {
	window.URL = window.webkitURL;
}
if(!navigator.getUserMedia) {
	navigator.getUserMedia  = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
}

var Camera = window.Camera = function(container, acceptCallback, rejectCallback) {
	if (!navigator.getUserMedia) {
		alert(' NO CAMERA FOR YOU');
	}

	var container = this.container = $(container);
	var videoEl = this.videoEl = document.createElement('video');
	var videoCanvas = this.videoCanvas = document.createElement('canvas');
	var videoContext = this.videoContext = videoCanvas.getContext('2d');

	videoEl.autoplay = true;

	navigator.getUserMedia({video: true, audio: false}, function(sourceStream) {
		container.append(videoEl);
		videoEl.src = window.URL.createObjectURL(sourceStream);
		acceptCallback();
	}, function(e) {
		rejectCallback();
	});
}

Camera.prototype.takePicture = function() {
	var video = this.videoEl,
		canvas = this.videoCanvas,
		context = this.videoContext;

	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0);

	return canvas.toDataURL('image/png');
};

})(window, document, $);