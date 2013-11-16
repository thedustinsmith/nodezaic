;(function($, doc, win) {
  	"use strict";

	function ImagePicker(el, opts) {
		var defaultOpts = {
			loadMoreSel: '.load-more',
			multiple: false
		};

		var self = this;
		this.opts = $.extend(defaultOpts, opts);
		this.$el  = $(el);
		this.$loadMore  = this.$el.find(this.opts.loadMoreSel);
		this.$imageList  = this.$el.find('.modal-listing');
		this.$images  = this.$el.find('img');

		this.init();

		this.$el.on('show', function() {
			self.showImages();
		})
	};

	ImagePicker.prototype.init = function() {
		var that = this;
		this.$loadMore.on('click', function() { that.loadMore(); return false; });
		this.$images.on('click', function() { SocialNetworks.setImage(this); this.$el.modal('hide'); });
	};

	ImagePicker.prototype.showImages = function() {
		if(this.nextUrl && this.nextUrl != '') {
			this.loadMore();
			this.modal.modal();
			return;
		}

		var that = this,
			callbackUrl = win.location.origin + '/socialcallback',
			authUrl = 'https://instagram.com/oauth/authorize/?client_id=' + app.InstagramID + '&redirect_uri=' + callbackUrl + '&response_type=token';

		win.authCallback = function(token){
			// SocialNetworks.toggleLoading(that.modal);
			$.ajax({
				url: 'https://api.instagram.com/v1/users/self/media/recent?access_token=' + token + '&callback=?',
				type:'GET',
				dataType:"json",
				success: function(resp) {
					that.appendImages(resp.data);
					that.nextUrl = resp.pagination.next_url;
					that.$loadMore.toggle(that.nextUrl && that.nextUrl != '');
					that.$el.modal();
				}
			});
		}

		win.open(authUrl, "Instagram", "width=600, height=400");
	};

	ImagePicker.prototype.appendImages = function(images) {
		var list = this.$imagelist,
			imgWidth = 100;

		$(images).each(function() {
			if(this.images) {
				var url = this.images.standard_resolution.url,
					img = document.createElement("img"); 

				img.src = url;
				img.width = imgWidth;
				list.append($("<li></li>").html(img));
			}
		});

		// SocialNetworks.toggleLoading(this.modal);
	};

	ImagePicker.prototype.loadMore = function() {
		var that = this;
		// SocialNetworks.toggleLoading(this.modal);
		$.ajax({
			url: that.nextUrl + '&callback=?',
			type: 'GET',
			dataType: 'JSON',
			success: function(resp) {
				that.appendImages(resp.data);
				that.nextUrl = resp.pagination.next_url;
				that.loadMoreLink.toggle(that.nextUrl && that.nextUrl != '');
			}
		});
	}

	$.fn.imagePicker = function(opts) {
		return this.each(function() {
			new ImagePicker(this, opts);
		});
	};

})(jQuery, document, window);

// // SocialNetworks.Facebook = {
// // 	isAuthenticated: false,
// // 	accessToken: '',
// // 	nextPage: '',
// // 	modal: $([]),
// // 	insertScript: function (id, url, content) {
// // 		var s = 'script',
// // 			d = document,
// // 			js,
// // 			fjs = d.getElementsByTagName(s)[0];
// // 		if (d.getElementById(id)) { return; }
// // 		js = d.createElement(s);
// // 		js.id = id;
// // 		js.src = url
// // 		if (content) {
// // 			js.innerHTML = content;
// // 		}
// // 		fjs.parentNode.insertBefore(js, fjs);
// // 	},
// // 	init: function() {
// // 		window.fbAsyncInit = this.onScriptInit;
// // 		this.insertScript('facebook-jssdk', '//connect.facebook.net/en_US/all.js');
// // 		this.modal = $('#facebook-modal');

// // 		var that = this;

// // 		$('.facebook').on('click', function() {
// // 			that.loadImages();
// // 			that.modal.modal();
// // 		});

// // 		this.modal.find('.load-more').on('click', function() {
// // 			that.loadImages();
// // 			return false;
// // 		});
// // 		this.modal.on('click', 'img', function() { SocialNetworks.setImage(this); that.modal.modal('hide'); });
// // 	},
// // 	onScriptInit: function () {
// // 		FB.init({
// // 			appId: app.FacebookID,
// // 			status: false,
// // 			xfbml: false
// // 		});
// // 		FB.getLoginStatus(function (resp) {
// // 			this.isAuthenticated = (resp.status === "connected");
// // 		});
// // 	},
// // 	authorize: function(c) {
// // 		var that = this;
// // 		if (this.isAuthenticated) {
// // 			c({ status: 'Already Authenticated' });
// // 			return;
// // 		}
// // 		FB.login(function (resp) {
// // 			that.isAuthenticated = (resp.status === "connected");
// // 			that.accessToken = resp.authResponse.accessToken; 
// // 			if (c)
// // 				c(resp);
// // 		}, {scope: 'user_photos,friends_photos'});
// // 	},
// // 	loadImages: function(){
// // 		var that = this;

// // 		this.authorize(function() { 
// // 			if(that.nextPage && that.nextPage != '') {
// // 				$.get(that.nextPage, that.appendImages);
// // 			}
// // 			else {
// // 				FB.api('/me/photos',  that.appendImages);
// // 			}
// // 			SocialNetworks.toggleLoading(that.modal);
// // 		});
// // 	},
// // 	appendImages: function(resp) {
// // 		SocialNetworks.Facebook.nextPage = resp.paging ? resp.paging.next : '';

// // 		var list = SocialNetworks.Facebook.modal.find('ul');
// // 		$(resp.data).each(function() {
// // 			var url = this.source.replace('https', 'http'),
// // 				img = document.createElement("img"); 

// // 			img.src = url;
// // 			img.width = 100;
// // 			list.append($("<li></li>").html(img));
// // 		});
// // 		SocialNetworks.toggleLoading(SocialNetworks.Facebook.modal);
// // 	}
// // }