$(function() {
	$("img").unveil();
	$("a.remove").on('click', function() {
		var link = $(this);
		var href = link.attr('href');
		$.get(href, function(resp) {
			if (resp.success === true) {
				link.closest('li').slideUp(function() {
					$(this).remove();
				});
			}
		});
		return false;
	});
});