$(function() {
	var hash = window.location.hash,
		token = hash.split("=")[1];

	window.opener.authCallback(token);
	window.close();
})