document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('photography-page')) return;

  /* =========================================================
     SAFETY PATCH – satisfy main.js dependency
     ========================================================= */
  if (!document.querySelector('.scroll-top')) {
    const dummy = document.createElement('a');
    dummy.className = 'scroll-top';
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
  }

  const filtersContainer = document.querySelector('.gallery-filters');
  const galleryContainer = document.querySelector('.gallery-container');

  if (!filtersContainer || !galleryContainer) return;

  fetch('assets/img/photography/gallery.json')
    .then(res => res.json())
    .then(data => {
      const categories = new Set();

      data.projects.forEach(project => {
        project.categories.forEach(c => categories.add(c));

        const col = document.createElement('div');
        col.className = `col-lg-4 col-md-6 project-item ${project.categories.join(' ')}`;

        /* -------------------------------
           Build hidden gallery anchors
        -------------------------------- */
        const galleryId = `gallery-${project.id}`;

        let anchors = '';
        project.images.forEach(img => {
          anchors += `
            <a
              href="${project.path + img}"
              class="lg-item"
              data-lg-size="1600-1067"
              data-sub-html="<h4>${project.title}</h4>"
            ></a>
          `;
        });

        col.innerHTML = `
          <div class="project-card" data-gallery="${galleryId}">
            <img src="${project.path + project.cover}" alt="${project.title}">
            <div class="project-overlay">
              <div>
                <div class="project-title">${project.title}</div>
                <div class="project-categories">${project.categories.join(', ')}</div>
              </div>
            </div>
          </div>

          <div id="${galleryId}" class="lg-hidden">
            ${anchors}
          </div>
        `;

        galleryContainer.appendChild(col);

        /* -------------------------------
           Init LightGallery PER PROJECT
        -------------------------------- */
        const lgContainer = col.querySelector(`#${galleryId}`);
        const lgInstance = lightGallery(lgContainer, {
          selector: '.lg-item',
          download: false,
          controls: true,
          closable: true,
          loop: true,
          counter: true
        });

        /* -------------------------------
           Open gallery on card click
        -------------------------------- */
        col.querySelector('.project-card')
          .addEventListener('click', () => {
            lgInstance.openGallery(0);
          });
      });

      /* -------------------------------
         Filters
      -------------------------------- */
      filtersContainer.innerHTML =
        `<button class="filter-btn active" data-filter="*">All</button>` +
        [...categories].map(c =>
          `<button class="filter-btn" data-filter=".${c}">${c}</button>`
        ).join('');

      imagesLoaded(galleryContainer, () => {
        const iso = new Isotope(galleryContainer, {
          itemSelector: '.project-item',
          layoutMode: 'fitRows'
        });

        filtersContainer.addEventListener('click', e => {
          if (!e.target.classList.contains('filter-btn')) return;

          filtersContainer.querySelectorAll('.filter-btn')
            .forEach(b => b.classList.remove('active'));

          e.target.classList.add('active');
          iso.arrange({ filter: e.target.dataset.filter });
        });
      });
    })
    .catch(err => console.error('Gallery error:', err));
});
