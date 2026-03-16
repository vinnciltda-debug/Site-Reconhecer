/* ============================================
   RECONHECER 2026 - Gallery JS
   Lightbox para galeria de fotos
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var galleryItems = document.querySelectorAll('.gallery-item');
    var currentIndex = 0;

    // Coletar imagens da galeria (exclui placeholders)
    function getGalleryImages() {
        var images = [];
        galleryItems.forEach(function (item, index) {
            var img = item.querySelector('img');
            if (img) {
                images.push({
                    src: img.src,
                    alt: img.alt || 'Foto do evento',
                    index: index
                });
            }
        });
        return images;
    }

    // Abrir lightbox
    function openLightbox(index) {
        var images = getGalleryImages();
        if (images.length === 0) return; // Não abre se só tem placeholders

        currentIndex = index;
        lightboxImage.src = images[currentIndex].src;
        lightboxImage.alt = images[currentIndex].alt;
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        updateNavButtons(images.length);
    }

    // Fechar lightbox
    function closeLightbox() {
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Navegar
    function navigateLightbox(direction) {
        var images = getGalleryImages();
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = images.length - 1;
        if (currentIndex >= images.length) currentIndex = 0;

        lightboxImage.src = images[currentIndex].src;
        lightboxImage.alt = images[currentIndex].alt;
        updateNavButtons(images.length);
    }

    function updateNavButtons(total) {
        lightboxPrev.style.display = total > 1 ? '' : 'none';
        lightboxNext.style.display = total > 1 ? '' : 'none';
    }

    // Event listeners
    galleryItems.forEach(function (item, index) {
        item.addEventListener('click', function () {
            // Só abre se tiver imagem (não placeholder)
            var img = item.querySelector('img');
            if (img) {
                openLightbox(index);
            }
        });

        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var img = item.querySelector('img');
                if (img) {
                    openLightbox(index);
                }
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
    lightboxNext.addEventListener('click', function () { navigateLightbox(1); });

    // Fechar com ESC / Navegar com setas
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('show')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Fechar ao clicar no fundo
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

});
