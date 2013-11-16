$.prototype.nzSlider = function() {
	var $slider = $(this).find('.slider'),
		$slides = $(this).find('.slide'),
		slideWidth = $(this).width(),
		totalWidth = $slides.length * slideWidth;

	$slides.width(slideWidth);
	$slider.width(totalWidth); 

	$(this).find('.next').click(function() {
		var slide = $(this).closest('.slide').data('slide');
		$slider.stop().animate({left: -(slide * slideWidth) + 'px'}, { duration: 1000, easing: 'easeOutExpo'});
	});

	$(this).find('.prev').click(function() {
		var	left = parseInt($slider.css('left').replace('px', '')) + slideWidth;
		$slider.stop().animate({left: left + 'px'}, { duration: 1000, easing: 'easeOutExpo'});
	});
}