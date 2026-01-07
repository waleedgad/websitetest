document.addEventListener("DOMContentLoaded", async () => {
  const filtersEl = document.querySelector(".gallery-filters");
  const gridEl = document.querySelector(".gallery-container");
  if (!filtersEl || !gridEl) return;

  const res = await fetch("/assets/img/photography/gallery.json");
  const data = await res.json();
  const projects = data.projects || [];

  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  /* FILTERS */
  const filterMap = new Map();
  projects.forEach(p => {
    if (p.categories?.length) {
      filterMap.set(slug(p.categories[0]), p.categories[0]);
    }
  });

  filtersEl.innerHTML =
    `<button class="filter-btn active" data-filter="*">All</button>` +
    [...filterMap.entries()]
      .map(([k, v]) => `<button class="filter-btn" data-filter=".${k}">${v}</button>`)
      .join("");

  /* GRID */
  projects.forEach(p => {
    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${slug(p.categories[0])}`;

    const galleryAnchors = p.images
      .map(
        img => `
          <a
            href="${p.path + img}"
            data-src="${p.path + img}"
            data-lg-thumb="${p.path + img}"
            data-sub-html="
              <h4>${p.title}</h4>
              <p>${p.description || ""}</p>
            "
          >
            <img src="${p.path + img}" class="d-none" alt="">
          </a>
        `
      )
      .join("");

    col.innerHTML = `
      <div class="project-card is-loading">
        <img
          src="${p.path + p.cover}"
          class="project-cover"
          alt="${p.title}"
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        >

        <div class="lg-items">
          ${galleryAnchors}
        </div>

        <div class="project-overlay">
          <div>
            <div class="project-title">${p.title}</div>
            <div class="project-categories">${p.allCategories.join(" / ")}</div>
          </div>
        </div>
      </div>
    `;

    gridEl.appendChild(col);
  });

  /* ISOTOPE */
  const iso = new Isotope(gridEl, {
    itemSelector: ".gallery-item",
    layoutMode: "masonry",
    percentPosition: true,
    masonry: { columnWidth: ".gallery-item" }
  });

  /* Debounced layout */
  let layoutRAF;
  const scheduleLayout = () => {
    cancelAnimationFrame(layoutRAF);
    layoutRAF = requestAnimationFrame(() => iso.layout());
  };

  /* PER-IMAGE LOAD (SKELETON → SHOW) */
  gridEl.querySelectorAll(".project-cover").forEach(img => {
    const card = img.closest(".project-card");

    if (img.complete) {
      card.classList.remove("is-loading");
      card.classList.add("is-loaded");
    } else {
      img.addEventListener("load", () => {
        card.classList.remove("is-loading");
        card.classList.add("is-loaded");
        scheduleLayout();
      });
    }
  });

  imagesLoaded(gridEl).on("progress", scheduleLayout);

  /* FILTER CLICK */
  filtersEl.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;
    filtersEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    iso.arrange({ filter: e.target.dataset.filter });
  });

  /* =========================================
     LIGHTGALLERY — LAZY INIT (PER CARD)
     ========================================= */

  document.querySelectorAll(".project-card").forEach(card => {
    const gallery = card.querySelector(".lg-items");
    let lgInstance = null;

    card.querySelector(".project-cover").addEventListener("click", () => {
      if (!lgInstance) {
        lgInstance = lightGallery(gallery, {
          selector: "a",
          plugins: [lgThumbnail, lgZoom],

          thumbnail: true,
          zoom: false,
          counter: true,
          download: false,
          fullScreen: false,

          closable: true,
          escKey: true,
          swipeToClose: true,
          hideScrollbar: true
        });
      }

      lgInstance.openGallery(0);
    });
  });
});