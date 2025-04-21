"use strict";
jQuery(document).ready(function ($) {
  // Smooth scrolling for navbar links
  $('#navbar-menu').find('a[href*="#"]:not([href="#"])').click(function () {
    if (
      location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      location.hostname === this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        if ($('.navbar-toggle').css('display') !== 'none') {
          $(this).parents('.container').find('.navbar-toggle').trigger('click');
        }
        return false;
      }
    }
  });

  // Show/hide scroll-to-top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 600) {
      $('#scrollUp').fadeIn('slow');
    } else {
      $('#scrollUp').fadeOut('slow');
    }
  });

  // Scroll to top on click
  $('#scrollUp').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 1000);
    return false;
  });

  // Handle "Show More" button click to open gallery window
  $('.show-more-btn').click(function () {
    var category = $(this).data('category');
    var displayCategory = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    var galleryWindow = window.open('', '_blank');

    fetch(`/.netlify/functions/get_images/${category}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch images for category: ${category} (Status: ${response.status})`);
        }
        return response.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('Raw response:', text);
            throw new Error('Invalid JSON response: ' + e.message);
          }
        });
      })
      .then((data) => {
        var images = data || [];
        var galleryHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>${displayCategory} Gallery</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css" />
            <style>
              body { background: #f2f7fa; padding: 20px; font-family: sans-serif; }
              h2 { color: #ffcb0f; text-transform: uppercase; font-family: sans-serif; }
              .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
              .gallery-grid img { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; }
              .gallery-grid a { display: block; }
              .gallery-grid img[onerror] { display: none; }
            </style>
          </head>
          <body>
            <h2>${displayCategory} Projects</h2>
            <div class="gallery-grid">
              ${
                images.length > 0
                  ? images
                      .map(
                        (img, index) =>
                          `<a class="fancybox" href="${img.secure_url}" data-fancybox-group="gallery"><img src="${img.secure_url}" alt="${displayCategory} Image ${index + 1}" loading="lazy"></a>`
                      )
                      .join('')
                  : '<p>No images found for this category.</p>'
              }
            </div>
            <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js"></script>
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
      })
      .catch((error) => {
        console.error('Error fetching gallery images:', error);
        var galleryHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>${displayCategory} Gallery</title>
            <style>
              body { background: #f2f7fa; padding: 20px; font-family: sans-serif; }
              h2 { color: #ffcb0f; text-transform: uppercase; font-family: sans-serif; }
            </style>
          </head>
          <body>
            <h2>${displayCategory} Projects</h2>
            <p>Error loading images: ${error.message}</p>
          </body>
          </html>
        `;
        galleryWindow.document.write(galleryHtml);
        galleryWindow.document.close();
      });
  });

  // Fade out loading animation on window load
  $(window).load(function () {
    $('#loading').fadeOut(500);
  });
});

// Load gallery images for a specific category
function loadGallery(category) {
  const gallery = document.querySelector(`.grid-item.${category} .portfolio_hover_area`);
  if (!gallery) {
    console.error(`Gallery container not found for category: ${category}`);
    return;
  }

  fetch(`/.netlify/functions/get_images/${category}`, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch images for category: ${category} (Status: ${response.status})`);
      }
      return response.text().then(text => {
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Raw response:', text);
          throw new Error('Invalid JSON response: ' + e.message);
        }
      });
    })
    .then((data) => {
      if (!data || data.length === 0) {
        gallery.innerHTML = `<p class="error-msg">No images found for category: ${category}</p>`;
        return;
      }
      gallery.innerHTML = data
        .map(
          (image) => `
            <a class="fancybox" href="${image.secure_url}" data-fancybox-group="${category}" title="${category} Project">
              <img src="${image.secure_url}" alt="${category} Project" loading="lazy">
            </a>
          `
        )
        .join('');
      $('.fancybox').fancybox();
    })
    .catch((error) => {
      console.error('Error loading gallery:', error);
      gallery.innerHTML = `<p class="error-msg">Error loading gallery: ${error.message}</p>`;
    });
}