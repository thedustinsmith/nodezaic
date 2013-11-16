$(function() {
	var nodesaicWrapper = $("#nodesaic-wrapper"),
		cameraHolder = $("#camera-holder"),
		mainImage = $("#main-image"),
		mosaicImage = $("#mosaic-image"),
		mosaic = new MosaicJS();

var Nodesaic = window.Nodesaic = {
	camera: null,
	url: '',
	subImages: [],
	validateFile: function(file) {
		if (file.size > 3000000) { //~3mb
			return false;
		}
		return true;
	},
	uploadImage: function(dataUrl, type) {
		$.post('/imagestore', {
			imgData: dataUrl,
			fileType: type || 'image/png'
		});
	},
	createMosaic: function(dataUrl) {
		var tmp = new Image();
		tmp.onload = function() {
			mosaic.setMainImage(tmp);
			mosaic.setSubImages(Nodesaic.subImages);
			var mosaicUrl = mosaic.createMosaic(tmp);
			nodesaicWrapper.addClass("loading");
			$.post('/mosaics', {
				imgData: mosaicUrl
			}, function() {
				nodesaicWrapper.removeClass("loading");
				mosaicImage.attr("src", mosaicUrl);
			})
		}
		tmp.src = dataUrl;
	},
	onFileUpload: function(e, file) {
		if (!Nodesaic.validateFile(file)) { 
			alert('There was an error');
			return;
		}
		Nodesaic.uploadImage(e.target.result, file.type);
		Nodesaic.createMosaic(e.target.result);
	},
	usePicture: function(url, filetype) {
		if(!filetype) {
			filetype = 'image/png';
		}
		if(!url) {
			url = Nodesaic.url;
		}

		Nodesaic.uploadImage(url, filetype);
		Nodesaic.createMosaic(url);
	},
	loadSubImages: function() {
		$.get('/imagestore', function(resp) {
			for(var i = 0; i < resp.length; i++) {
				var img = new Image();
				img.onload = function() { Nodesaic.subImages.push(this); }
				img.src = resp[i];
			}
		});
	},
	init: function() {
		this.loadSubImages();
		var fileupload = $("#upload-image, #nodesaic-wrapper").fileReaderJS({
		    readAsMap: {
		        'image/*': 'DataURL',
		        'text/*' : 'Text'
		    },
		    readAsDefault: 'BinaryString',
		    on: {
		    	load: Nodesaic.onFileUpload
		    }
		});

		function showCamera(ev) {
			ev.preventDefault();
			var changeView = function() {
				nodesaicWrapper.removeClass('showing-mosaic').addClass('showing-video');
			}
			if (Nodesaic.camera) {
				changeView();
				return;
			}

			Nodesaic.camera = new Camera(cameraHolder, changeView, function() {
				alert("YOU FOOL!!  DO YOU REALIZE WHAT YOU'VE DONE?!");
			});
		}

		var btnUseCamera = $("#use-camera");
		btnUseCamera.on('click', showCamera);
		$("#picture-again").on('click', showCamera);

		var btnTakePicture = $("#take-picture");
		btnTakePicture.on('click', function(ev) {
			ev.preventDefault();
			if (!Nodesaic.camera) {
				return false;
			}
			Nodesaic.url = Nodesaic.camera.takePicture();
			$('#main-image').attr('src', Nodesaic.url);

			nodesaicWrapper.removeClass('showing-video').addClass('showing-mosaic');
		});

		$('#generate').on('click', function() {
			Nodesaic.usePicture();
		});

		$("#back-to-initial").on('click', function (e) {
			e.preventDefault();
			nodesaicWrapper.removeClass('showing-video showing-mosaic');
		})
	}
};

	var bestBrowsers = ['Chrome', 'Firefox'];
	if(bestBrowsers.indexOf(BrowserDetect.browser) === -1) {
		$("#old-browser").modal();
	}

	Nodesaic.init();

	var slider = $('.slide-holder').nzSlider();
	var picker = $('#instagram-modal').imagePicker();
	$('.instagram').click(function() {
		picker.trigger('show');
	});

});


var app = {};





// Full version of `log` that:
//  * Prevents errors on console methods when no console present.
//  * Exposes a global 'log' function that preserves line numbering and formatting.
(function () {
  var method;
  var noop = function () { };
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
        console[method] = noop;
    }
  }


  if (Function.prototype.bind) {
    window.log = Function.prototype.bind.call(console.log, console);
  }
  else {
    window.log = function() { 
      Function.prototype.apply.call(console.log, console, arguments);
    };
  }
})();
