/**
 * LDW.BUILD — Dynamic Nav Loader
 * ================================
 * Alternative to copy-pasting nav HTML into every page.
 * Include this script and a <nav id="site-nav"></nav> placeholder
 * to automatically load the unified navigation.
 *
 * USAGE:
 *   <nav id="site-nav"></nav>
 *   <script src="/nav-loader.js"></script>
 *
 * The script auto-detects the current page and applies class="active"
 * to the matching nav link.
 */

(function () {
  'use strict';

  var NAV_LINKS = [
    { label: 'About',       href: '/#about' },
    { label: 'Speaking',     href: '/speaking.html' },
    { label: 'Books',        href: '/books.html' },
    { label: 'Work With Me', href: '/#consulting' },
    { label: 'Media',        href: '/media.html' },
    { label: 'Content',      href: '/content-hub.html' },
    { label: 'Vantage',      href: '/vantage.html' }
  ];

  var BRAND_SVG =
    '<svg width="28" height="28" viewBox="0 0 240 240" fill="none">' +
    '<polygon points="40,180 120,130 120,55 40,105" fill="#F2F0EB"/>' +
    '<polygon points="120,55 200,105 200,180 120,130" fill="#C17F59"/>' +
    '<polygon points="40,180 120,230 200,180 120,130" fill="rgba(242,240,235,0.06)"/>' +
    '</svg>';

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  nav.className = 'site-nav';

  // Brand
  var brand = document.createElement('a');
  brand.href = '/';
  brand.className = 'site-nav-brand';
  brand.innerHTML = BRAND_SVG + '<span class="site-nav-name">LONNELL WILLIAMS</span>';

  // Links
  var linksDiv = document.createElement('div');
  linksDiv.className = 'site-nav-links';
  linksDiv.id = 'navLinks';

  var currentPath = window.location.pathname;

  NAV_LINKS.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;

    // Detect active page
    if (item.href === currentPath ||
        (currentPath === '/' && item.href.startsWith('/#')) ||
        (currentPath === '/index.html' && item.href.startsWith('/#'))) {
      // Don't mark anchor links as active on homepage
    } else if (item.href === currentPath) {
      a.className = 'active';
    }

    // Fix homepage anchor links (use # instead of /# when on homepage)
    if ((currentPath === '/' || currentPath === '/index.html') &&
        item.href.startsWith('/#')) {
      a.href = item.href.substring(1); // Remove leading /
    }

    linksDiv.appendChild(a);
  });

  // Mobile toggle
  var btn = document.createElement('button');
  btn.className = 'site-nav-btn';
  btn.setAttribute('aria-label', 'Toggle navigation menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.addEventListener('click', function () {
    linksDiv.classList.toggle('open');
  });

  nav.appendChild(brand);
  nav.appendChild(linksDiv);
  nav.appendChild(btn);
})();
