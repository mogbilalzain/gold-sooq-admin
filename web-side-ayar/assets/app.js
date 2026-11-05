/* =========================================================
   سوق عيار — Public site interactions
   - Theme toggle (dark mode, persisted)
   - Sticky header shadow on scroll
   - Mobile drawer
   - Scroll reveal via IntersectionObserver
   - Live price ticker (simulated; swap PRICES with a real API later)
   - Count-up stats
   - FAQ accordion (single-open)
   - Sticky mobile CTA visibility
   - Smooth in-page anchors
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
     PRICES — single source of truth for the ticker & cards.
     Replace this object with a fetch() to a public prices API
     when one becomes available.
     --------------------------------------------------------- */
  const PRICES = {
    updatedAt: new Date(),
    currency: 'درهم',
    karats: [
      { key: '24k', label: 'عيار 24', price: 473.00, delta: +0.42 },
      { key: '22k', label: 'عيار 22', price: 433.00, delta: +0.38 },
      { key: '21k', label: 'عيار 21', price: 414.00, delta: -0.15 },
      { key: '18k', label: 'عيار 18', price: 355.00, delta: +0.21 }
    ],
    ounceUsd: 4006.94,
    usdAed: 3.673
  };

  // ------------------------------ Theme (dark mode)
  function initTheme() {
    const stored = localStorage.getItem('ayar-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }

  function syncThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    $$('[data-theme-icon]').forEach((icon) => {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }

  function bindThemeToggle() {
    $$('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('ayar-theme', isDark ? 'dark' : 'light');
        syncThemeIcon();
      });
    });
  }

  // ------------------------------ Header shadow
  function bindHeaderScroll() {
    const header = $('.ayar-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ------------------------------ Scroll-spy
  function bindScrollSpy() {
    const links = $$('[data-spy]');
    if (!links.length) return;
    const targets = links
      .map((link) => ({ link, el: document.querySelector(link.getAttribute('href')) }))
      .filter((t) => t.el);
    if (!targets.length) return;

    const headerOffset = 110;
    let ticking = false;

    const setActive = (href) => {
      links.forEach((l) => {
        const active = l.getAttribute('href') === href;
        l.classList.toggle('is-active', active);
        if (active) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY + headerOffset;
      let current = targets[0];
      const sorted = targets.slice().sort((a, b) => a.el.offsetTop - b.el.offsetTop);
      for (const t of sorted) {
        if (t.el.offsetTop <= y) current = t;
      }
      // Near page bottom: activate the last section
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 40) {
        current = sorted[sorted.length - 1];
      }
      setActive(current.link.getAttribute('href'));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // ------------------------------ Mobile drawer
  function bindDrawer() {
    const openBtn  = $('[data-drawer-open]');
    const closeBtn = $('[data-drawer-close]');
    const drawer   = $('.ayar-drawer');
    const backdrop = $('.ayar-drawer-backdrop');
    if (!openBtn || !drawer || !backdrop) return;

    const open = () => {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.classList.add('is-drawer-open');
      drawer.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.classList.remove('is-drawer-open');
      drawer.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
    };
    openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    $$('.ayar-drawer a[href^="#"]').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  // ------------------------------ Scroll reveal
  function bindReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  // ------------------------------ Live price ticker
  function renderPrices() {
    $$('[data-karat-price]').forEach((el) => {
      const k = PRICES.karats.find((x) => x.key === el.dataset.karatPrice);
      if (k) el.textContent = k.price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    });
    $$('[data-karat-delta]').forEach((el) => {
      const k = PRICES.karats.find((x) => x.key === el.dataset.karatDelta);
      if (!k) return;
      const up = k.delta >= 0;
      el.textContent = (up ? '▲ ' : '▼ ') + Math.abs(k.delta).toFixed(2) + '%';
      el.classList.toggle('text-emerald-600', up);
      el.classList.toggle('text-rose-500', !up);
    });
    const ounce = $('[data-ounce-price]');
    if (ounce) ounce.textContent = PRICES.ounceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fx = $('[data-fx-rate]');
    if (fx) fx.textContent = PRICES.usdAed.toFixed(3);
    const stamp = $('[data-price-updated]');
    if (stamp) {
      stamp.textContent = PRICES.updatedAt.toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' });
    }
  }

  function bindLiveTicker() {
    const cells = $$('[data-live-price]');
    if (!cells.length) return;
    cells.forEach((el) => {
      const v = parseFloat((el.dataset.basePrice || el.textContent).replace(/[^\d.\-]/g, ''));
      el.dataset.basePrice = String(v);
    });
    setInterval(() => {
      cells.forEach((el) => {
        const base = parseFloat(el.dataset.basePrice || '0');
        if (!base) return;
        const drift = (Math.random() - 0.5) * (base * 0.004);
        const next = base + drift;
        el.textContent = next.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        el.classList.remove('price-flash');
        void el.offsetWidth; // restart animation
        el.classList.add('price-flash');
        const delta = el.closest('[data-live-cell]') && el.closest('[data-live-cell]').querySelector('[data-live-delta]');
        if (delta) {
          const pct = ((drift / base) * 100).toFixed(2);
          const up = drift >= 0;
          delta.textContent = (up ? '▲ ' : '▼ ') + Math.abs(pct) + '%';
          delta.classList.toggle('text-emerald-600', up);
          delta.classList.toggle('text-rose-500', !up);
        }
      });
    }, 2500);
  }

  // ------------------------------ Count-up stats
  function bindCountUp() {
    const nums = $$('[data-countup]');
    if (!nums.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.countup);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach((el) => io.observe(el));
  }

  // ------------------------------ FAQ: keep one open at a time
  function bindFaq() {
    const items = $$('.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  }

  // ------------------------------ Hide sticky mobile CTA near #download
  function bindStickyCtaVisibility() {
    const cta = $('[data-sticky-cta]');
    const download = document.getElementById('download');
    if (!cta || !download || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        cta.style.transform = entry.isIntersecting ? 'translateY(110%)' : 'translateY(0)';
      });
    }, { threshold: 0.1 });
    io.observe(download);
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

  // ------------------------------ Phone parallax (download section)
  // Uses the CSS `translate` property so it composes with Tailwind rotate transforms.
  function bindPhoneParallax() {
    const scene = $('[data-parallax-scene]');
    if (!scene) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const layers = $$('[data-parallax]', scene);
    if (!layers.length) return;
    let raf = null;
    scene.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = scene.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((el) => {
          const depth = parseFloat(el.dataset.parallax || '10');
          el.style.translate = `${(-nx * depth).toFixed(1)}px ${(-ny * depth).toFixed(1)}px`;
        });
        raf = null;
      });
    });
    scene.addEventListener('mouseleave', () => {
      layers.forEach((el) => { el.style.translate = '0px 0px'; });
    });
  }

  // ------------------------------ Hero WebGL shader (gold glow)
  function initHeroShader() {
    const canvas = document.getElementById('hero-shader');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.remove();
      return;
    }
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { canvas.remove(); return; } // CSS .hero-fallback stays visible

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncSize).observe(canvas);
    syncSize();

    const vs = `attribute vec2 a_position; varying vec2 v_uv;
      void main(){ v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `precision highp float; uniform float u_time; varying vec2 v_uv;
      void main(){
        vec2 center = vec2(0.75, 0.45);
        float d = distance(v_uv, center);
        vec3 color = vec3(0.992, 0.973, 0.973);
        vec3 gold = vec3(0.839, 0.706, 0.173);
        color = mix(color, gold, smoothstep(0.85, 0.0, d) * 0.10);
        color += sin(v_uv.x * 10.0 + v_uv.y * 5.0 + u_time * 0.5) * 0.004;
        gl_FragColor = vec4(color, 1.0);
      }`;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    (function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    })(0);
  }

  initTheme();
  document.addEventListener('DOMContentLoaded', () => {
    syncThemeIcon();
    bindThemeToggle();
    bindHeaderScroll();
    bindScrollSpy();
    bindDrawer();
    bindReveal();
    renderPrices();
    bindLiveTicker();
    bindCountUp();
    bindFaq();
    bindStickyCtaVisibility();
    bindAnchorScroll();
    bindPhoneParallax();
    initHeroShader();
  });
})();
