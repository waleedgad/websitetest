/**
 * Global Header Loader (auto)
 * Injects header.html into #site-header on all pages.
 */
document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (mount) {
    fetch("assets/partials/header.html")
      .then(r => r.text())
      .then(html => {
          mount.innerHTML = html;
          if (typeof window.initNavMenu === 'function') {
            window.initNavMenu();
          }
        })
      .catch(e => console.error("Global header load failed:", e));
  }
});

/* ============================
   ORIGINAL TEMPLATE JS BELOW
   (unchanged behavior)
   ============================ */
/**
* Template Name: FolioOne
* Template URL: https://bootstrapmade.com/folioone-bootstrap-portfolio-website-template/
* Updated: Aug 23 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle helper (queries elements at runtime)
   */
  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    const btn = document.querySelector('.mobile-nav-toggle');
    if (btn) {
      btn.classList.toggle('bi-list');
      btn.classList.toggle('bi-x');
    }
  }

  /**
   * Allow tapping the dropdown row (anchor) to toggle its submenu on mobile
   * - only for mobile widths, keep desktop hover behaviour
   * - prevents the generic '#navmenu a' handler from closing the menu
   */
  function isMobileWidth() {
    return window.matchMedia('(max-width: 1199px)').matches;
  }

  /**
   * Expose an idempotent initializer so we can call it after
   * the header is dynamically injected. It avoids duplicate listeners
   * by marking elements with `data-nav-init` once handled.
   */
  window.initNavMenu = function() {
    // Mobile toggle button
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    if (toggleBtn && !toggleBtn.dataset.navInit) {
      toggleBtn.addEventListener('click', mobileNavToogle);
      toggleBtn.dataset.navInit = 'true';
    }

    // Hide mobile nav on same-page/hash links
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      if (navmenu.dataset.navInit) return;
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });
      navmenu.dataset.navInit = 'true';
    });

    // Toggle mobile nav dropdown icons
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      if (navmenu.dataset.navInit) return;
      navmenu.addEventListener('click', function(e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
        if (this.parentNode.nextElementSibling) this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
      navmenu.dataset.navInit = 'true';
    });

    // Anchor row toggles for dropdowns on mobile
    document.querySelectorAll('#navmenu li.dropdown > a').forEach(anchor => {
      if (anchor.dataset.navInit) return;
      anchor.addEventListener('click', function(e) {
        try {
          if (!isMobileWidth()) return; // desktop: keep hover behavior
          if (e.target && e.target.classList && e.target.classList.contains('toggle-dropdown')) return;
          e.preventDefault();
          this.parentNode.classList.toggle('active');
          var submenu = this.nextElementSibling;
          if (submenu) submenu.classList.toggle('dropdown-active');
          e.stopImmediatePropagation();
        } catch (err) {
          // do nothing on error
        }
      }, false);
      anchor.dataset.navInit = 'true';
    });
  };

  // Run once on load in case header markup is already present
  window.addEventListener('load', function() {
    if (typeof window.initNavMenu === 'function') window.initNavMenu();
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Close mobile nav when clicking/tapping outside the menu panel (mobile only)
   * - respects existing toggle logic by calling `mobileNavToogle()`
   * - does not modify HTML or existing handlers
   */
  (function() {
    function isMobileWidth() {
      return window.matchMedia('(max-width: 1199px)').matches;
    }

    document.addEventListener('click', function(e) {
      try {
        if (!isMobileWidth()) return; // desktop unaffected
        if (!document.body.classList.contains('mobile-nav-active')) return; // only when open
        var panel = document.querySelector('.mobile-nav-active .navmenu>ul');
        var toggle = document.querySelector('.mobile-nav-toggle');
        // If click is inside panel or on the toggle, ignore
        if (panel && panel.contains(e.target)) return;
        if (toggle && toggle.contains(e.target)) return;
        // otherwise close using existing toggle function
        if (typeof mobileNavToogle === 'function') mobileNavToogle();
      } catch (err) {
        // silent - do not interrupt existing behaviour
      }
    }, false);
  })();

})();
// Close navbar & dropdowns when clicking outside
document.addEventListener("click", function (e) {
  const navbar = document.querySelector(".navbar");
  const collapse = document.getElementById("baristaNavbar");

  if (navbar && navbar.contains(e.target)) return;

  if (collapse && collapse.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(collapse).hide();
  }

  document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
    const toggle = menu.previousElementSibling;
    if (toggle) {
      bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
    }
  });
});