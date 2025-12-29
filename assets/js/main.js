/**
 * Template Main JS (Fully Defensive Patch)
 * Safe for all pages
 */

(function () {
  "use strict";

  /* ==========================
     Helper functions
  ========================== */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (!selectEl) return;

    if (all) {
      selectEl.forEach(e => e.addEventListener(type, listener));
    } else {
      selectEl.addEventListener(type, listener);
    }
  };

  const onscroll = (el, listener) => {
    if (!el) return;
    el.addEventListener('scroll', listener);
  };

  /* ==========================
     Header scroll class
  ========================== */
  const headerScrolled = () => {
    const header = select('#header');
    if (!header) return;

    if (window.scrollY > 100) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('load', headerScrolled);
  onscroll(document, headerScrolled);

  /* ==========================
     Scroll top button
  ========================== */
  const scrollTop = select('.scroll-top');
  if (scrollTop) {
    const toggleScrollTop = () => {
      if (window.scrollY > 100) {
        scrollTop.classList.add('active');
      } else {
        scrollTop.classList.remove('active');
      }
    };

    window.addEventListener('load', toggleScrollTop);
    onscroll(document, toggleScrollTop);

    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================
     Mobile nav toggle
  ========================== */
  on('click', '.mobile-nav-toggle', function () {
    const body = document.body;
    body.classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /* ==========================
     Mobile nav dropdowns
  ========================== */
  on('click', '.navbar .dropdown > a', function (e) {
    const body = document.body;
    if (!body.classList.contains('mobile-nav-active')) return;

    e.preventDefault();
    this.nextElementSibling.classList.toggle('dropdown-active');
  }, true);

  /* ==========================
     Preloader (safe)
  ========================== */
  const preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

})();
