/**
 * LDW.BUILD — Site-Wide Nav + Footer Patch
 * Adds: Articles link to nav + footer | Substack link to footer
 * Include in each HTML page: <script src="/nav-patch.js" defer></script>
 */

(function() {
  'use strict';

  // ── 1. Add "Articles" to top nav ──────────────────────────────────────────
  // Finds the Media nav link and inserts Articles after it
  function patchTopNav() {
    const navLinks = document.querySelectorAll('nav a, header a, .nav-links a, .site-nav a');
    let mediaLink = null;

    // Find the Media link in the nav
    navLinks.forEach(function(link) {
      if (link.textContent.trim().toLowerCase() === 'media' &&
          (link.href.includes('media.html') || link.getAttribute('href') === '/media.html')) {
        mediaLink = link;
      }
    });

    if (mediaLink) {
      // Check if Articles link already exists
      const existing = document.querySelector('a[href="/articles.html"]');
      if (existing) return; // Already patched

      const articlesLink = document.createElement('a');
      articlesLink.href = '/articles.html';
      articlesLink.textContent = 'Articles';

      // Copy the same styling/class as Media link
      if (mediaLink.className) {
        articlesLink.className = mediaLink.className;
      }

      // Insert after Media
      mediaLink.parentNode.insertBefore(articlesLink, mediaLink.nextSibling);
    }
  }

  // ── 2. Add "Articles" to footer nav column ────────────────────────────────
  function patchFooterNav() {
    // Find all links in the page, look for footer context
    const allLinks = document.querySelectorAll('footer a, .site-footer a, .footer a');
    let footerMediaLink = null;

    allLinks.forEach(function(link) {
      if (link.textContent.trim().toLowerCase() === 'media' &&
          (link.href.includes('media.html') || link.getAttribute('href') === '/media.html')) {
        footerMediaLink = link;
      }
    });

    if (footerMediaLink) {
      // Check if Articles already exists in footer
      const footerArticlesExists = Array.from(allLinks).some(function(l) {
        return l.getAttribute('href') === '/articles.html';
      });
      if (footerArticlesExists) return;

      const articlesLink = document.createElement('a');
      articlesLink.href = '/articles.html';
      articlesLink.textContent = 'Articles';

      if (footerMediaLink.className) {
        articlesLink.className = footerMediaLink.className;
      }

      // Match display style of sibling links
      articlesLink.style.cssText = footerMediaLink.style.cssText;

      footerMediaLink.parentNode.insertBefore(articlesLink, footerMediaLink.nextSibling);
    }
  }

  // ── 3. Add Substack link to footer ────────────────────────────────────────
  function patchFooterSubstack() {
    // Find "LONNELL DAWSON WILLIAMS" text node or footer connect section
    const footer = document.querySelector('footer, .site-footer, .footer');
    if (!footer) return;

    // Check if Substack link already in footer
    const substackExists = Array.from(footer.querySelectorAll('a')).some(function(a) {
      return a.href.includes('substack.com');
    });
    if (substackExists) return;

    // Find the copyright / connect area — look for "LONNELL DAWSON WILLIAMS" text
    let connectBlock = null;
    const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('LONNELL DAWSON WILLIAMS')) {
        connectBlock = node.parentElement;
        break;
      }
    }

    // If we found the connect block, add Substack link before it
    if (connectBlock) {
      const substackLink = document.createElement('a');
      substackLink.href = 'https://buildwithldw.substack.com';
      substackLink.target = '_blank';
      substackLink.rel = 'noopener';
      substackLink.textContent = '↗ Arise & Build — Substack';
      substackLink.style.cssText = [
        'font-family: "Space Mono", monospace',
        'font-size: 10px',
        'letter-spacing: 2px',
        'text-transform: uppercase',
        'color: #C17F59',
        'text-decoration: none',
        'display: block',
        'margin-bottom: 12px',
        'transition: opacity 0.2s'
      ].join(';');

      substackLink.onmouseover = function() { this.style.opacity = '0.7'; };
      substackLink.onmouseout  = function() { this.style.opacity = '1'; };

      connectBlock.parentNode.insertBefore(substackLink, connectBlock);
    } else {
      // Fallback: append to last footer column
      const footerCols = footer.querySelectorAll('[class*="col"], [class*="section"], [class*="group"]');
      const lastCol = footerCols[footerCols.length - 1];
      if (lastCol) {
        const substackLink = document.createElement('a');
        substackLink.href   = 'https://buildwithldw.substack.com';
        substackLink.target = '_blank';
        substackLink.rel    = 'noopener';
        substackLink.textContent = '↗ Arise & Build — Substack';
        substackLink.style.cssText = [
          'font-family:"Space Mono",monospace',
          'font-size:10px',
          'letter-spacing:2px',
          'text-transform:uppercase',
          'color:#C17F59',
          'text-decoration:none',
          'display:block',
          'margin-top:16px'
        ].join(';');
        lastCol.appendChild(substackLink);
      }
    }
  }

  // ── Run after DOM is ready ─────────────────────────────────────────────────
  function runPatches() {
    patchTopNav();
    patchFooterNav();
    patchFooterSubstack();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPatches);
  } else {
    runPatches();
  }

})();
