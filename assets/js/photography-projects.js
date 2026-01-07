document.addEventListener("DOMContentLoaded", async () => {
  const filtersEl = document.querySelector(".gallery-filters");
  const gridEl = document.querySelector(".gallery-container");
  if (!filtersEl || !gridEl) return;

  const res = await fetch("/assets/img/photography/gallery.json");
  const data = await res.json();
  const projects = data.projects || [];

  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  /* ===============================
     FILTERS
     =============================== */
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

  document.dispatchEvent(new CustomEvent("gallery:ui-ready"));

  /* ===============================
     RENDER HELPERS
     =============================== */
  const createCard = p => {
    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${slug(p.categories[0])}`;

    const galleryAnchors = p.images
      .map(
        img => `
          <a
            href="${p.path + img}"
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
      <div class="project-card is-loading"
           data-project-id="${p.id}"
           data-gallery-group="${p.gallery_group || ""}">
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

    return col;
  };

  /* ===============================
     INITIAL RENDER
     =============================== */
  const INITIAL_COUNT = window.innerWidth < 768 ? 6 : 9;
  const initialProjects = projects.slice(0, INITIAL_COUNT);
  const remainingProjects = projects.slice(INITIAL_COUNT);

  initialProjects.forEach(p => gridEl.appendChild(createCard(p)));

  const iso = new Isotope(gridEl, {
    itemSelector: ".gallery-item",
    layoutMode: "masonry",
    percentPosition: true,
    masonry: { columnWidth: ".gallery-item" }
  });

  let layoutRAF;
  const scheduleLayout = () => {
    cancelAnimationFrame(layoutRAF);
    layoutRAF = requestAnimationFrame(() => iso.layout());
  };

  const bindImageLoad = scope => {
    scope.querySelectorAll(".project-cover").forEach(img => {
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
  };

  bindImageLoad(gridEl);
  imagesLoaded(gridEl).on("progress", scheduleLayout);

  filtersEl.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;
    filtersEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    iso.arrange({ filter: e.target.dataset.filter });
  });

  if (remainingProjects.length) {
    setTimeout(() => {
      const newItems = [];

      remainingProjects.forEach(p => {
        const el = createCard(p);
        gridEl.appendChild(el);
        newItems.push(el);
      });

      iso.appended(newItems);
      bindImageLoad(gridEl);
      scheduleLayout();
    }, 600);
  }

  /* ===============================
     LIGHTGALLERY — FIXED MERGED GALLERIES
     =============================== */
  document.addEventListener("click", e => {
    const cover = e.target.closest(".project-cover");
    if (!cover) return;

    const card = cover.closest(".project-card");
    const galleryGroup = card.dataset.galleryGroup;

    let items = [];

    if (galleryGroup) {
      const clickedId = card.dataset.projectId;

      const orderedProjects = [
        ...projects.filter(p => p.id === clickedId),
        ...projects.filter(p => p.gallery_group === galleryGroup && p.id !== clickedId)
      ];

      orderedProjects.forEach(p => {
        p.images.forEach(img => {
          items.push({
            src: p.path + img,
            thumb: p.path + img,
            subHtml: `<h4>${p.title}</h4><p>${p.description || ""}</p>`
          });
        });
      });
    } else {
      card.querySelectorAll(".lg-items a").forEach(a => {
        items.push({
          src: a.getAttribute("href"),
          thumb: a.getAttribute("data-lg-thumb"),
          subHtml: a.getAttribute("data-sub-html")
        });
      });
    }

    const lg = lightGallery(document.createElement("div"), {
      dynamic: true,
      dynamicEl: items,
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

    lg.openGallery(0);
  });
});