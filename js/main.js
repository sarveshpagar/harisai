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
    var images = [];
    for (var i = 1; i <= 200; i++) {
      var imgPath = `images/${category}/image${i}.JPG`;
      var img = new Image();
      img.src = imgPath;
      if (img.complete && img.naturalWidth === 0) {
        break;
      }
      images.push(imgPath);
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
          ${images.map((img, index) => `<a class="fancybox" href="${img}" data-fancybox-group="gallery"><img src="${img}" alt="${displayCategory} Image ${index + 1}" loading="lazy"></a>`).join('')}
        </div>
        <script src="js/jquery-1.12.1.min.js"></script>
        <script src="js/jquery.fancybox.js?v=2.1.5"></script>
        <script>
          $(document).ready(function() {
            $('.fancybox').fancybox();
          });
        </script>
      </body>
      </html>
    `;
    galleryWindow.document.write(galleryHtml);
    galleryWindow.document.close();
  });

  $(window).load(function () {
    $("#loading").fadeOut(500);
  });
});

function loadGallery(category) {
    const gallery = document.querySelector(`.grid-item.${category} .portfolio_hover_area`);
    fetch(`https://res.cloudinary.com/djbxxkpji/image/list/${category}.json`)
        .then((response) => response.json())
        .then((data) => {
            gallery.innerHTML = data.resources
                .map(
                    (image) => `
                    <a class="fancybox" href="${image.secure_url}" data-fancybox-group="${category}">
                        <img src="${image.secure_url}" alt="${category} Project">
                    </a>
                `
                )
                .join('');
        })
        .catch((error) => console.error('Error loading gallery:', error));
}