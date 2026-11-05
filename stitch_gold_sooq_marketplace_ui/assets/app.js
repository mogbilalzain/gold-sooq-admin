/* =========================================================
   Gold Sooq — Shared interactions
   - Sticky header shadow on scroll
   - Mobile drawer toggle
   - Scroll reveal via IntersectionObserver
   - Live ticker with simulated price updates
   - Active nav link based on current page
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ------------------------------ Active nav link
  function highlightActiveNav() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.gs-nav-link').forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (!href) return;
      const target = href.split('/').pop();
      if (target === path || (path === '' && target === 'index.html')) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // ------------------------------ Header shadow
  function bindHeaderScroll() {
    const header = $('.gs-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ------------------------------ Mobile drawer
  function bindDrawer() {
    const openBtn  = $('[data-drawer-open]');
    const closeBtn = $('[data-drawer-close]');
    const drawer   = $('.gs-drawer');
    const backdrop = $('.gs-drawer-backdrop');
    if (!openBtn || !drawer || !backdrop) return;

    const open  = () => {
      drawer.classList.add('is-open');
      document.body.classList.add('is-drawer-open');
      drawer.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      drawer.classList.remove('is-open');
      document.body.classList.remove('is-drawer-open');
      drawer.setAttribute('aria-hidden', 'true');
    };
    openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // ------------------------------ Scroll reveal
  function bindReveal() {
    const items = $$('.reveal');
    if (!items.length || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  // ------------------------------ Live price ticker
  // Animates random small fluctuations on visible price cells.
  function bindLiveTicker() {
    const cells = $$('[data-live-price]');
    if (!cells.length) return;

    const seedFor = (el) => {
      const v = parseFloat((el.dataset.basePrice || el.textContent).replace(/[^\d.\-]/g, ''));
      el.dataset.basePrice = String(v);
      return v;
    };
    cells.forEach(seedFor);

    setInterval(() => {
      cells.forEach((el) => {
        const base = parseFloat(el.dataset.basePrice || '0');
        if (!base) return;
        const drift = (Math.random() - 0.5) * (base * 0.004);
        const next = base + drift;
        const formatted = next.toLocaleString('en-US', {
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        });
        el.textContent = formatted;
        const delta = el.parentElement && el.parentElement.querySelector('[data-live-delta]');
        if (delta) {
          const pct = ((drift / base) * 100).toFixed(2);
          const up = drift >= 0;
          delta.textContent = (up ? '▲ ' : '▼ ') + Math.abs(pct) + '%';
          delta.classList.toggle('text-emerald-500', up);
          delta.classList.toggle('text-rose-500', !up);
        }
      });
    }, 2200);
  }

  // ------------------------------ Smooth in-page anchors
  function bindAnchorScroll() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    highlightActiveNav();
    bindHeaderScroll();
    bindDrawer();
    bindReveal();
    bindLiveTicker();
    bindAnchorScroll();
  });
})();
