document.addEventListener('DOMContentLoaded', function() {
    const galleryElement = document.querySelector('.gallery');
    if (galleryElement) {
      mauGallery(galleryElement, {
        columns: 3,
        lightBox: true,
        lightboxId: 'myLightbox',
        showTags: true,
        tagsPosition: 'bottom',
        navigation: true
      });
    }
  });
