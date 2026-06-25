/* ============================================================
   ScrollHero — brand-NEUTRAL scroll-scrub hero engine
   No colors, no fonts, no brand tokens live here. Brand comes
   entirely from a preset stylesheet (presets/*.css) applied to
   the same markup. Shared infrastructure (scroll-driven-video).

   Requires GSAP + ScrollTrigger on the page.
   Fixes every issue from the original Elementor script:
     - image sequence (browser-managed memory), NOT decoded video in RAM
     - ScrollTrigger handles pin + scrub (no window-scroll / sticky math;
       works even when a smooth-scroll lib owns the scroll)
     - graceful fallbacks: prefers-reduced-motion / mobile / save-data -> poster
     - error handling: a missing frame never leaves a stuck loader
     - teardown via .destroy()
   ============================================================ */
(function () {
  function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }

  function init(opts) {
    const root = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el;
    if (!root) return null;

    const cfg = Object.assign({
      fit: 'cover',            // 'cover' | 'contain'
      scrollLength: 3,         // viewport-heights of scroll the scrub spans
      mobileBreakpoint: 768,   // below this -> static poster (unless mobileScrub:true)
      mobileScrub: false,
      dprCap: 2
    }, opts);

    const f = cfg.frames || {};
    const pad = f.pad || 4;
    // Two ways to supply frames: an explicit url list (f.urls), or a dir/prefix/count pattern.
    const urls = (f.urls && f.urls.length) ? f.urls : null;
    const N = urls ? urls.length : (f.count || 0);
    const frameURL = (i) => urls ? urls[i]
      : `${f.dir}/${f.prefix || ''}${String(i + 1).padStart(pad, '0')}.${f.ext || 'webp'}`;
    const posterURL = cfg.poster || (N ? frameURL(0) : '');

    // ---- build structure (preserve any existing children as the overlay) ----
    root.classList.add('sh-root');
    const pin = el('div', 'sh-pin');
    const poster = el('div', 'sh-poster');
    if (posterURL) poster.style.backgroundImage = `url("${posterURL}")`;
    const canvas = el('canvas', 'sh-canvas');
    const loader = el('div', 'sh-loader');
    const overlay = el('div', 'sh-overlay');
    while (root.firstChild) overlay.appendChild(root.firstChild);
    pin.appendChild(poster);
    pin.appendChild(canvas);
    pin.appendChild(loader);
    pin.appendChild(overlay);
    root.appendChild(pin);

    const ctx = canvas.getContext('2d', { alpha: false });
    const frames = [];
    let iw = 0, ih = 0, cur = -1, ready = false, st = null;

    function resize() {
      const d = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
      canvas.width = Math.round(pin.clientWidth * d);
      canvas.height = Math.round(pin.clientHeight * d);
      cur = -1;
    }
    function draw(i) {
      const img = frames[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      if (!iw) { iw = img.naturalWidth; ih = img.naturalHeight; }
      const s = cfg.fit === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      cur = i;
    }

    // ---- fallback path: no scrub, just the poster ----
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    const smallScreen = window.innerWidth < cfg.mobileBreakpoint;
    if (!N || reduce || saveData || (smallScreen && !cfg.mobileScrub)) {
      root.classList.add('sh-static');
      loader.remove();
      return { destroy() {} };
    }

    // ---- load the image sequence (Image elements = evictable, low peak RAM) ----
    let loaded = 0, failed = 0;
    function settle() {
      if (loaded + failed < N) return;
      ready = true;
      root.classList.add('sh-ready');
      loader.classList.add('sh-hide');
      if (failed === N) root.classList.add('sh-static'); // total failure -> poster
    }
    for (let i = 0; i < N; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        loaded++;
        if (i === 0) { resize(); draw(0); poster.classList.add('sh-hide'); }
        settle();
      };
      img.onerror = () => { failed++; settle(); };
      img.src = frameURL(i);
      frames[i] = img;
    }

    // ---- pin + scrub via ScrollTrigger ----
    function wire() {
      window.gsap.registerPlugin(window.ScrollTrigger);
      resize();
      st = window.ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: () => '+=' + (cfg.scrollLength * window.innerHeight),
        pin: pin,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.round(self.progress * (N - 1));
          if (i !== cur && frames[i] && frames[i].complete) draw(i);
        }
      });
      window.addEventListener('resize', onResize, { passive: true });
    }
    function onResize() { resize(); draw(cur < 0 ? 0 : cur); window.ScrollTrigger && window.ScrollTrigger.refresh(); }

    if (window.gsap && window.ScrollTrigger) {
      wire();
    } else {
      const t = setInterval(() => {
        if (window.gsap && window.ScrollTrigger) { clearInterval(t); wire(); }
      }, 50);
      setTimeout(() => clearInterval(t), 6000);
    }

    return {
      destroy() {
        if (st) st.kill(true);
        window.removeEventListener('resize', onResize);
        frames.length = 0;
      }
    };
  }

  window.ScrollHero = { init };
})();
