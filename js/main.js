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
        var displayCategory = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        var galleryWindow = window.open('', '_blank');
        console.log('Opening gallery for category:', category);

        fetch('images.json')
            .then(response => {
                if (!response.ok) {
                    console.error('Fetch error:', response.status, response.statusText);
                    throw new Error('Failed to load images.json');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                const images = data[category] || [];
                console.log('Images for', category, ':', images.length);
                const maxImages = 50;
                const limitedImages = images.slice(0, maxImages);

                if (limitedImages.length === 0) {
                    console.warn('No images found for category:', category);
                    throw new Error('No images available for this category');
                }

                var galleryHtml = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="utf-8">
                        <title>${displayCategory} Gallery</title>
                        <link rel="stylesheet" href="css/jquery.fancybox.css?v=2.1.5" />
                        <style>
                            body { background: #f2f7fa; padding: 20px; font-family: 'futura_ltbook', sans-serif; }
                            h2 { color: #ffcb0f; text-transform: uppercase; font-family: 'futura_ltbold', sans-serif; }
                            .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
                            .gallery-grid img { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; }
                            .gallery-grid a { display: block; }
                            .gallery-grid img[onerror] { display: none; }
                        </style>
                    </head>
                    <body>
                        <h2>${displayCategory} Projects</h2>
                        <div class="gallery-grid">
                            ${limitedImages.map((img, index) => `
                                <a class="fancybox" href="${img}" data-fancybox-group="gallery" rel="gallery">
                                    <img src="${img}" alt="${displayCategory} Image ${index + 1}" loading="lazy" onerror="this.style.display='none';">
                                </a>
                            `).join('')}
                        </div>
                        <script src="http://localhost:8000/js/jquery-1.12.1.min.js"></script>
                        <script src="http://localhost:8000/js/jquery.fancybox.js?v=2.1.5"></script>
                        <script>
                            $(document).ready(function() {
                                console.log('Initializing Fancybox in gallery with', $('.fancybox').length, 'images');
                                $('.fancybox').fancybox({
                                    openEffect: 'elastic',
                                    closeEffect: 'elastic',
                                    prevEffect: 'fade',
                                    nextEffect: 'fade',
                                    helpers: {
                                        title: { type: 'inside' },
                                        buttons: {}
                                    }
                                });
                            });
                        </script>
                    </body>
                    </html>
                `;

                if (galleryWindow) {
                    galleryWindow.document.open();
                    galleryWindow.document.write(galleryHtml);
                    galleryWindow.document.close();
                    console.log('Gallery window loaded with', limitedImages.length, 'images');
                } else {
                    console.error('Popup blocked or failed to open');
                    alert('Please allow popups for this site to view the gallery.');
                }
            })
            .catch(error => {
                console.error('Error loading gallery:', error);
                if (galleryWindow) galleryWindow.close();
                alert(`Failed to load ${displayCategory} gallery. Check console for details.`);
            });
    });

    $(window).load(function () {
        $("#loading").fadeOut(500);
    });
});