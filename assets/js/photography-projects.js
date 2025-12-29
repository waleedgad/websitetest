document.addEventListener("DOMContentLoaded", () => {

  const gridEl = document.querySelector(".gallery-container");
  const filtersEl = document.querySelector(".gallery-filters");
  const lightboxEl = document.getElementById("project-lightbox");

  let galleryInstance = null;
  let allProjects = [];

  /* ==========================
     LOAD JSON
  ========================== */
  fetch("assets/img/photography/gallery.json")
    .then(res => res.json())
    .then(data => {
      allProjects = data.projects;
      renderFilters(allProjects);
      renderGrid(allProjects);
      initIsotope();
    })
    .catch(err => console.error("Gallery JSON error:", err));

  /* ==========================
     FILTERS
  ========================== */
  function renderFilters(projects) {
    const cats = new Set(["all"]);
    projects.forEach(p => p.categories.forEach(c => cats.add(c)));

    cats.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.filter = cat === "all" ? "*" : `.${cat}`;
      btn.textContent = cat;
      if (cat === "all") btn.classList.add("active");
      filtersEl.appendChild(btn);
    });
  }

  /* ==========================
     GRID
  ========================== */
  function renderGrid(projects) {
    projects.forEach(project => {

      const col = document.createElement("div");
      col.className = `col-md-4 ${project.categories.join(" ")}`;

      col.innerHTML = `
        <div class="project-card" data-id="${project.id}">
          <img src="${project.path + project.cover}" alt="${project.title}">
          <div class="project-overlay">
            <div>
              <div class="project-title">${project.title}</div>
              <div class="project-categories">${project.categories.join(", ")}</div>
            </div>
          </div>
        </div>
      `;

      gridEl.appendChild(col);
    });
  }

  /* ==========================
     ISOTOPE
  ========================== */
  function initIsotope() {
    imagesLoaded(gridEl, () => {
      const iso = new Isotope(gridEl, {
        itemSelector: ".col-md-4",
        layoutMode: "fitRows"
      });

      filtersEl.addEventListener("click", e => {
        if (!e.target.classList.contains("filter-btn")) return;

        filtersEl.querySelectorAll(".filter-btn")
          .forEach(b => b.classList.remove("active"));

        e.target.classList.add("active");
        iso.arrange({ filter: e.target.dataset.filter });
      });
    });
  }

  /* ==========================
     DYNAMIC LIGHTGALLERY
  ========================== */
  gridEl.addEventListener("click", e => {
    const card = e.target.closest(".project-card");
    if (!card) return;

    const projectId = card.dataset.id;
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const images = project.images.map(img => ({
      src: project.path + img,
      thumb: project.path + img
    }));

    // Destroy previous instance cleanly
    if (galleryInstance) {
      galleryInstance.destroy(true);
      galleryInstance = null;
    }

    galleryInstance = lightGallery(lightboxEl, {
      dynamic: true,
      dynamicEl: images,
      plugins: [lgThumbnail, lgZoom],
      thumbnail: true,
      zoom: true,
      download: false,
      counter: true,
      closable: true,
      escKey: true
    });

    galleryInstance.openGallery(0);
  });

});
