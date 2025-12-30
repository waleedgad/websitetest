/**
 * GLOBAL JS — CLEANED & AUDITED
 * - Single gallery logic (LightGallery ONLY)
 * - No GLightbox
 * - Guarded initializations
 * - Safe header injection
 */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (mount) {
    fetch("assets/partials/header.html")
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html;
        if (typeof window.initNavMenu === "function") {
          window.initNavMenu();
        }
      })
      .catch(e => console.error("Global header load failed:", e));
  }
});

(function () {
  "use strict";

  /* ===============================
     SCROLLED HEADER
     =============================== */
  function toggleScrolled() {
    const body = document.body;
    const header = document.querySelector("#header");
    if (!header) return;

    if (
      !header.classList.contains("scroll-up-sticky") &&
      !header.classList.contains("sticky-top") &&
      !header.classList.contains("fixed-top")
    ) return;

    window.scrollY > 100
      ? body.classList.add("scrolled")
      : body.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /* ===============================
     MOBILE NAV
     =============================== */
  function mobileNavToggle(forceClose = false) {
    const body = document.body;
    const btn = document.querySelector(".mobile-nav-toggle");
    const collapse = document.querySelector(".navbar-collapse");

    if (forceClose) {
      body.classList.remove("mobile-nav-active");
      if (collapse) collapse.classList.remove("show");
    } else {
      body.classList.toggle("mobile-nav-active");
    }

    if (btn) {
      btn.classList.toggle("bi-list");
      btn.classList.toggle("bi-x");
    }
  }

  function isMobile() {
    return window.matchMedia("(max-width: 1199px)").matches;
  }

  window.initNavMenu = function () {
    const toggleBtn = document.querySelector(".mobile-nav-toggle");

    if (toggleBtn && !toggleBtn.dataset.navInit) {
      toggleBtn.addEventListener("click", e => {
        e.stopPropagation();
        mobileNavToggle();
      });
      toggleBtn.dataset.navInit = "true";
    }

    document.querySelectorAll("#navmenu a").forEach(link => {
      if (link.dataset.navInit) return;
      link.addEventListener("click", () => {
        if (document.body.classList.contains("mobile-nav-active")) {
          mobileNavToggle(true);
        }
      });
      link.dataset.navInit = "true";
    });

    document.querySelectorAll("#navmenu li.dropdown > a").forEach(anchor => {
      if (anchor.dataset.navInit) return;
      anchor.addEventListener("click", e => {
        if (!isMobile()) return;
        e.preventDefault();
        anchor.parentNode.classList.toggle("active");
        const submenu = anchor.nextElementSibling;
        if (submenu) submenu.classList.toggle("dropdown-active");
      });
      anchor.dataset.navInit = "true";
    });

    /* Outside click close */
    if (!document.body.dataset.navOutsideInit) {
      document.addEventListener("click", e => {
        if (!isMobile()) return;

        const isOpen =
          document.body.classList.contains("mobile-nav-active") ||
          document.querySelector(".navbar-collapse.show");

        if (!isOpen) return;

        const header =
          document.querySelector("#header") ||
          document.querySelector("#site-header") ||
          document.querySelector(".navbar");

        if (header && !header.contains(e.target)) {
          mobileNavToggle(true);
        }
      });

      document.body.dataset.navOutsideInit = "true";
    }
  };

  window.addEventListener("load", () => {
    if (typeof window.initNavMenu === "function") window.initNavMenu();
  });

  /* ===============================
     PRELOADER
     =============================== */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => preloader.remove());
  }

  /* ===============================
     SCROLL TOP
     =============================== */
  const scrollTop = document.querySelector(".scroll-top");
  if (scrollTop) {
    scrollTop.addEventListener("click", e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const toggleScrollTop = () => {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    };

    window.addEventListener("load", toggleScrollTop);
    document.addEventListener("scroll", toggleScrollTop);
  }

  /* ===============================
     AOS
     =============================== */
  window.addEventListener("load", () => {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false
      });
    }
  });

  /* ===============================
     TYPED
     =============================== */
  const typedEl = document.querySelector(".typed");
  if (typedEl && typeof Typed !== "undefined") {
    const strings = typedEl.getAttribute("data-typed-items").split(",");
    new Typed(".typed", {
      strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /* ===============================
     COUNTERS
     =============================== */
  if (typeof PureCounter !== "undefined") {
    new PureCounter();
  }

  /* ===============================
     SWIPER
     =============================== */
  window.addEventListener("load", () => {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll(".init-swiper").forEach(el => {
      const cfg = el.querySelector(".swiper-config");
      if (!cfg) return;
      const config = JSON.parse(cfg.innerHTML.trim());
      new Swiper(el, config);
    });
  });

  /* ===============================
     ISOTOPE
     =============================== */
  if (typeof Isotope !== "undefined" && typeof imagesLoaded !== "undefined") {
    document.querySelectorAll(".isotope-layout").forEach(layout => {
      const container = layout.querySelector(".isotope-container");
      if (!container) return;

      imagesLoaded(container, () => {
        const iso = new Isotope(container, {
          itemSelector: ".isotope-item",
          layoutMode: layout.dataset.layout || "masonry"
        });

        layout.querySelectorAll(".isotope-filters li").forEach(btn => {
          btn.addEventListener("click", () => {
            layout
              .querySelector(".filter-active")
              ?.classList.remove("filter-active");
            btn.classList.add("filter-active");
            iso.arrange({ filter: btn.dataset.filter });
          });
        });
      });
    });
  }

  /* ===============================
     SKILLS PROGRESS BAR ANIMATION ✅ FIX
     =============================== */
  const skillsSection = document.querySelector(".skills-animation");

  if (skillsSection && typeof Waypoint !== "undefined") {
    new Waypoint({
      element: skillsSection,
      offset: "80%",
      handler: function () {
        document
          .querySelectorAll(".skills-animation .progress-bar")
          .forEach(bar => {
            const value = bar.getAttribute("aria-valuenow");
            bar.style.width = value + "%";
          });

        this.destroy();
      }
    });
  }

  /* ======================================================
     IMAGE PROTECTION — SAFE / NON-DESTRUCTIVE
     ====================================================== */
  document.addEventListener("contextmenu", e => {
    if (e.target.closest("img")) e.preventDefault();
  });

  document.addEventListener("dragstart", e => {
    if (e.target.closest("img")) e.preventDefault();
  });

  document.addEventListener(
    "touchstart",
    e => {
      if (e.target.closest("img")) e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && ["s", "u"].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      ["i", "j"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }

    if (e.key === "PrintScreen") {
      e.preventDefault();
      navigator.clipboard?.writeText("");
    }
  });

  // ❌ GLightbox REMOVED
})();