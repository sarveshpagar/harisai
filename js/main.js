"use strict";
jQuery(document).ready(function ($) {
    $('#navbar-menu').find('a[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: (target.offset().top - 0)
                }, 1000);
                if ($('.navbar-toggle').css('display') != 'none') {
                    $(this).parents('.container').find(".navbar-toggle").trigger("click");
                }
                return false;
            }
        }
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 600) {
            $('#scrollUp').fadeIn('slow');
        } else {
            $('#scrollUp').fadeOut('slow');
        }
    });

    $('#scrollUp').click(function () {
        $("html, body").animate({scrollTop: 0}, 1000);
        return false;
    });

    $('.fancybox').fancybox();

    $('.show-more-btn').click(function () {
        var category = $(this).data('category');
        // Open gallery.html with the category as a URL parameter
        window.open('gallery.html?category=' + encodeURIComponent(category), '_blank');
    });

    $(window).load(function () {
        $("#loading").fadeOut(500);
    });
    $('.hero-content-left .btn.know_btn').hover(
        function() {
            $(this).css('transform', 'scale(1.05)');
        },
        function() {
            $(this).css('transform', 'scale(1)');
        }
    );
    $(window).scroll(function() {
        if ($(window).width() > 767) { // Desktop only
            var scrollTop = $(this).scrollTop();
            $('.hero-3d').css('background-position-y', -(scrollTop * 0.2) + 'px');
        }
    });
    // Card click/tap
    $('.card').on('click touchend', function(e) {
        e.preventDefault();
        var category = $(this).data('category');
        window.location.href = 'gallery.html?category=' + encodeURIComponent(category);
    });
    // Mobile tap effect
    $('.card').on('touchstart', function() {
        $(this).addClass('touched');
        setTimeout(() => $(this).removeClass('touched'), 300);
    });
});