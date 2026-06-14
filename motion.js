/* motion.js — additive scroll motion for ldw.build (native, zero-dependency)
   - Reveal-on-scroll for static sections (skips the Vantage .v-reveal system)
   - Count-up for the consulting stats (2014 / 3 / 500+; skips "$8-Fig")
   Jump-proof: a throttled scroll-sweep reveals anything at/above the viewport, so
   anchor jumps, scroll restoration, and fast flicks can never leave content hidden.
   Progressive enhancement + prefers-reduced-motion safe.
   Include: <script src="/motion.js" defer></script> */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('lw-motion')) return; // head script decided no motion
  window.__lwMotionReady = true;

  var SEL = '.section-label,.section-title,.section-desc,.offer-item,.topic-card,.book-row,.consult-stat,.hero-tagline';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) {
    return !el.classList.contains('v-reveal') && !el.closest('[class*="vantage"]');
  });

  // Stagger by sibling index within the same parent (capped).
  var seen = {};
  nodes.forEach(function (el) {
    var k = (el.parentNode && el.parentNode.nodeType === 1) ? (el.parentNode.className || 'p') : 'p';
    seen[k] = (seen[k] || 0);
    var i = seen[k]++;
    var d = Math.min(i, 6) * 70;
    if (d) el.style.transitionDelay = d + 'ms';
  });

  function reveal(el) {
    el.classList.add('lw-in');
    var num = el.querySelector && el.querySelector('.consult-stat-num');
    if (num) countUp(num);
  }

  var pending = nodes.slice();
  function sweep() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    pending = pending.filter(function (el) {
      // Reveal anything that has entered the lower 92% of the viewport OR already scrolled past (top < 0).
      if (el.getBoundingClientRect().top < vh * 0.92) { reveal(el); return false; }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; sweep(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  requestAnimationFrame(sweep);   // initial (covers above-the-fold + load-at-position)
  setTimeout(sweep, 450);         // safety after fonts/layout settle

  function countUp(el) {
    if (el.dataset.lwCounted) return;
    var raw = (el.textContent || '').trim();
    if (/[a-zA-Z]/.test(raw)) return;            // skip non-numeric like "$8-Fig"
    var m = raw.match(/\d[\d,]*/);
    if (!m) return;
    el.dataset.lwCounted = '1';
    var useComma = /,/.test(raw);                 // keep year "2014" comma-free
    var target = parseInt(m[0].replace(/,/g, ''), 10);
    var prefix = raw.slice(0, m.index);
    var suffix = raw.slice(m.index + m[0].length);
    var dur = 1100, start = null;
    function fmt(n) { return useComma ? n.toLocaleString() : String(n); }
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);         // ease-out cubic
      el.textContent = prefix + fmt(Math.round(eased * target)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(frame);
  }

  // ── Scroll progress bar (Signal accent) ────────────────────────────
  (function () {
    var bar = document.createElement('div');
    bar.className = 'lw-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();
})();
