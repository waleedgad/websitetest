document.addEventListener("DOMContentLoaded", async () => {
  const filtersContainer = document.querySelector(".gallery-filters");
  const galleryContainer = document.querySelector(".gallery-container");
  if (!filtersContainer || !galleryContainer) return;

  const slugify = str => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  let data;
  try {
    const res = await fetch("assets/img/photography/gallery.json");
    data = await res.json();
  } catch {
    return;
  }

  const projects = data.projects || [];
  if (!projects.length) return;

  const filterMap = new Map();
  projects.forEach(p => {
    if (p.categories?.[0]) {
      filterMap.set(slugify(p.categories[0]), p.categories[0]);
    }
  });

  filtersContainer.innerHTML = `
    <button class="filter-btn active" data-filter="*">All</button>
    ${[...filterMap.entries()].map(([s,l]) =>
      `<button class="filter-btn" data-filter=".${s}">${l}</button>`).join("")}
  `;

  projects.forEach((project, index) => {
    const slug = slugify(project.categories[0]);
    const col = document.createElement("div");
    col.className = `col-lg-4 col-md-6 gallery-item ${slug}`;
    col.dataset.aos = "fade-up";
    col.dataset.aosDelay = index * 80;

    col.innerHTML = `
      <div class="project-card">
        <img src="${project.path + project.cover}" alt="${project.title}">
        <div class="project-overlay">
          <div>
            <div class="project-title">${project.title}</div>
            <div class="project-categories">${project.categories.join(" / ")}</div>
          </div>
        </div>
      </div>
    `;

    const hidden = document.createElement("div");
    hidden.className = "lg-hidden";
    project.images.forEach(img => {
      hidden.innerHTML += `<a href="${project.path + img}" class="project-link"></a>`;
    });

    col.appendChild(hidden);
    galleryContainer.appendChild(col);

    if (window.lightGallery) {
      lightGallery(hidden, {
        selector: ".project-link",
        thumbnail: true,
        zoom: true,
        download: false
      });
    }

    col.querySelector(".project-card").addEventListener("click", () => {
      hidden.querySelector(".project-link")?.click();
    });
  });

  const iso = new Isotope(galleryContainer, {
    itemSelector: ".gallery-item",
    layoutMode: "fitRows"
  });

  imagesLoaded(galleryContainer, () => {
    iso.layout();
    if (window.AOS) AOS.refreshHard();
  });

  filtersContainer.addEventListener("click", e => {
    if (!e.target.classList.contains("filter-btn")) return;
    filtersContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    iso.arrange({ filter: e.target.dataset.filter });
    if (window.AOS) AOS.refresh();
  });
});
