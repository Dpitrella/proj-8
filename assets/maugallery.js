(function() {
  const mauGallery = function(element, options) {
    const defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
    };

    options = Object.assign({}, defaults, options);
    const tagsCollection = [];

    function createRowWrapper() {
      if (!element.querySelector('.gallery-items-row')) {
        const row = document.createElement('div');
        row.className = 'gallery-items-row row';
        element.appendChild(row);
      }
    }

    function wrapItemInColumn(item, columns) {
      const column = document.createElement('div');
      column.className = 'item-column mb-4';

      if (typeof columns === 'number') {
        column.classList.add(`col-${Math.ceil(12 / columns)}`);
      } else if (typeof columns === 'object') {
        if (columns.xs) column.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
        if (columns.sm) column.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
        if (columns.md) column.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
        if (columns.lg) column.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
        if (columns.xl) column.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }

      item.parentNode.insertBefore(column, item);
      column.appendChild(item);
    }

    function moveItemInRowWrapper(item) {
      const row = element.querySelector('.gallery-items-row');
      if (row) {
        row.appendChild(item);
      }
    }

    function responsiveImageItem(item) {
      if (item.tagName === 'IMG') {
        item.classList.add('img-fluid');
      }
    }

    function createLightBox(lightboxId, navigation) {
      const lightbox = document.createElement('div');
      lightbox.className = 'modal fade';
      lightbox.id = lightboxId || 'galleryLightbox';
      lightbox.setAttribute('tabindex', '-1');
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-hidden', 'true');

      lightbox.innerHTML = `
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;"></span>'}
              <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;"></span>'}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(lightbox);

      const prevButton = lightbox.querySelector('.mg-prev');
      const nextButton = lightbox.querySelector('.mg-next');
      if (prevButton) prevButton.addEventListener('click', () => prevImage(element));
      if (nextButton) nextButton.addEventListener('click', () => nextImage(element));
    }

    function showItemTags(position, tags) {
      const tagItems = tags.map(tag => 
        `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`
      ).join('');

      const tagsRow = document.createElement('ul');
      tagsRow.className = 'my-4 tags-bar nav nav-pills';
      tagsRow.innerHTML = `
        <li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>
        ${tagItems}
      `;

      if (position === 'bottom') {
        element.insertBefore(tagsRow, element.firstChild);
      } else if (position === 'top') {
        element.appendChild(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    }

    function filterByTag(tag) {
      const items = element.querySelectorAll('.gallery-item');
      items.forEach(item => {
        const column = item.closest('.item-column');
        if (tag === 'all' || item.dataset.galleryTag === tag) {
          column.style.display = '';
        } else {
          column.style.display = 'none';
        }
      });
    }

    function openLightBox(imageSrc) {
      const lightbox = document.getElementById(options.lightboxId || 'galleryLightbox');
      const lightboxImage = lightbox.querySelector('.lightboxImage');
      lightboxImage.src = imageSrc;
      
      const modal = new bootstrap.Modal(lightbox);
      modal.show();
    }

    function prevImage(element) {
      const lightboxImage = document.querySelector('.lightboxImage');
      const activeTag = document.querySelector('.tags-bar .active-tag')?.dataset.imagesToggle || 'all';
      const items = Array.from(element.querySelectorAll('.gallery-item'));
      const filteredItems = activeTag === 'all' ? items : items.filter(item => item.dataset.galleryTag === activeTag);
      let index = filteredItems.findIndex(item => item.src === lightboxImage.src);
      if (index === -1) {
        console.error('Current image not found in filtered items');
        return;
      }
      index = (index - 1 + filteredItems.length) % filteredItems.length;
      lightboxImage.src = filteredItems[index].src;
    }

    function nextImage(element) {
      const lightboxImage = document.querySelector('.lightboxImage');
      const activeTag = document.querySelector('.tags-bar .active-tag')?.dataset.imagesToggle || 'all';
      const items = Array.from(element.querySelectorAll('.gallery-item'));
      const filteredItems = activeTag === 'all' ? items : items.filter(item => item.dataset.galleryTag === activeTag);
      let index = filteredItems.findIndex(item => item.src === lightboxImage.src);
      if (index === -1) {
        console.error('Current image not found in filtered items');
        return;
      }
      index = (index + 1) % filteredItems.length;
      lightboxImage.src = filteredItems[index].src;
    }

    function setupImageListeners() {
      const galleryItems = element.querySelectorAll('.gallery-item');
      galleryItems.forEach(item => {
        if (options.lightBox && item.tagName === 'IMG') {
          item.style.cursor = 'pointer';
          item.addEventListener('click', () => openLightBox(item.src));
        }
      });
    }

    createRowWrapper();

    if (options.lightBox) {
      createLightBox(options.lightboxId, options.navigation);
    }

    const galleryItems = element.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, options.columns);

      const theTag = item.dataset.galleryTag;
      if (options.showTags && theTag && !tagsCollection.includes(theTag)) {
        tagsCollection.push(theTag);
      }
    });

    setupImageListeners();

    if (options.showTags) {
      showItemTags(options.tagsPosition, tagsCollection);
    }

    element.addEventListener('click', function(e) {
      if (e.target.classList.contains('nav-link')) {
        const activeTag = element.querySelector('.active-tag');
        if (activeTag) activeTag.classList.remove('active', 'active-tag');
        e.target.classList.add('active', 'active-tag');
        filterByTag(e.target.dataset.imagesToggle);
      }
    });

    element.style.display = 'block';
  };

  window.mauGallery = mauGallery;
})();