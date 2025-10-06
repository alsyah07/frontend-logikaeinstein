(function ($) {
	
	"use strict";

	// Header Type = Fixed
	$(window).scroll(function() {
		var scroll = $(window).scrollTop();
		var box = $('.header-text').height();
		var header = $('header').height();

		if (scroll >= box - header) {
			$("header").addClass("background-header");
		} else {
			$("header").removeClass("background-header");
		}
	});


	$('.loop').owlCarousel({
		center: true,
		items:2,
		loop:true,
		nav: true,
		margin:30,
		responsive:{
			992:{
				items:4
			}
		}
	});
	

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() { 
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}


	// Menu elevator animation - DIPERBAIKI
	$('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function(e) {
		e.preventDefault();
		
		var href = $(this).attr('href');
		if (!href) return false;
		
		// Extract hash, handle both #section and /#section
		var hash = href.indexOf('#') !== -1 ? href.substring(href.indexOf('#')) : '';
		
		// Skip invalid hashes
		if (!hash || hash === '#') return false;
		
		// Handle #top specially
		if (hash === '#top') {
			$('html,body').animate({
				scrollTop: 0
			}, 700);
			return false;
		}
		
		// Try to find target element
		var target = $(hash);
		if (!target.length) {
			target = $('[name=' + hash.slice(1) +']');
		}
		
		if (target.length) {
			var width = $(window).width();
			if(width < 991) {
				$('.menu-trigger').removeClass('active');
				$('.header-area .nav').slideUp(200);  
			}       
			$('html,body').animate({
				scrollTop: (target.offset().top) + 1
			}, 700);
			return false;
		}
	});

	$(document).ready(function () {
		$(document).on("scroll", onScroll);
		
		//smoothscroll - DIPERBAIKI
		$('.scroll-to-section a[href^="#"]').on('click', function (e) {
			e.preventDefault();
			$(document).off("scroll");
			
			$('.scroll-to-section a').each(function () {
				$(this).removeClass('active');
			});
			$(this).addClass('active');
			
			var href = $(this).attr('href');
			
			// Handle #top or empty hash
			if (!href || href === '#' || href === '#top') {
				$('html, body').stop().animate({
					scrollTop: 0
				}, 500, 'swing', function () {
					$(document).on("scroll", onScroll);
				});
				return;
			}
			
			// Normal hash navigation
			var target = $(href);
			if (target.length) {
				$('html, body').stop().animate({
					scrollTop: (target.offset().top) + 1
				}, 500, 'swing', function () {
					window.location.hash = href;
					$(document).on("scroll", onScroll);
				});
			} else {
				$(document).on("scroll", onScroll);
			}
		});
	});

	// onScroll function - DIPERBAIKI
	function onScroll(event){
		var scrollPos = $(document).scrollTop();
		
		$('.nav a').each(function () {
			var currLink = $(this);
			var href = currLink.attr("href");
			
			// Skip invalid or non-hash links
			if (!href || href === '#' || href === '#top' || href.indexOf('#') === -1) {
				return true; // continue to next iteration
			}
			
			// Extract hash safely
			var hash = href.indexOf('#') !== -1 ? href.substring(href.indexOf('#')) : '';
			
			// Skip if no valid hash
			if (!hash || hash === '#' || hash === '#top') {
				return true;
			}
			
			// Try to find element safely
			try {
				var refElement = $(hash);
				
				if (refElement.length > 0) {
					var refTop = refElement.offset().top;
					var refBottom = refTop + refElement.height();
					
					if (refTop <= scrollPos && refBottom > scrollPos) {
						$('.nav ul li a').removeClass("active");
						currLink.addClass("active");
					} else {
						currLink.removeClass("active");
					}
				}
			} catch(err) {
				// Ignore selector errors silently
				console.log('Invalid selector:', hash);
			}
		});
	}


	// Page loading animation
	$(window).on('load', function() {
		$('#js-preloader').addClass('loaded');
	});

	

	// Window Resize Mobile Menu Fix
	function mobileNav() {
		var width = $(window).width();
		$('.submenu').on('click', function() {
			if(width < 767) {
				$('.submenu ul').removeClass('active');
				$(this).find('ul').toggleClass('active');
			}
		});
	}

})(window.jQuery);