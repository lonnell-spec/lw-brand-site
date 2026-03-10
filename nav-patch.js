/**
 * LDW.BUILD — Site-Wide Nav + Footer Patch
 * v2.0 — March 2026
 *
 * Patches applied:
 *   1. Articles link → top nav (after Media)
 *   2. Articles link → footer nav
 *   3. Substack link → footer
 *   4. Mobile CSS fixes → injected into <head> (all pages except vantage.html)
 *
 * Include in each HTML page: <script src="/nav-patch.js" defer></script>
 */

(function() {
  'use strict';

  // ── 1. Add "Articles" to top nav ──────────────────────────────────────────
  function patchTopNav() {
    const navLinks = document.querySelectorAll('nav a, header a, .nav-links a, .site-nav a');
    let mediaLink = null;

    navLinks.forEach(function(link) {
      if (link.textContent.trim().toLowerCase() === 'media' &&
          (link.href.includes('media.html') || link.getAttribute('href') === '/media.html')) {
        mediaLink = link;
      }
    });

    if (mediaLink) {
      const existing = document.querySelector('a[href="/articles.html"]');
      if (existing) return;

      const articlesLink = document.createElement('a');
      articlesLink.href = '/articles.html';
      articlesLink.textContent = 'Articles';

      if (mediaLink.className) {
        articlesLink.className = mediaLink.className;
      }

      mediaLink.parentNode.insertBefore(articlesLink, mediaLink.nextSibling);
    }
  }

  // ── 2. Add "Articles" to footer nav column ────────────────────────────────
  function patchFooterNav() {
    const allLinks = document.querySelectorAll('footer a, .site-footer a, .footer a');
    let footerMediaLink = null;

    allLinks.forEach(function(link) {
      if (link.textContent.trim().toLowerCase() === 'media' &&
          (link.href.includes('media.html') || link.getAttribute('href') === '/media.html')) {
        footerMediaLink = link;
      }
    });

    if (footerMediaLink) {
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

      articlesLink.style.cssText = footerMediaLink.style.cssText;

      footerMediaLink.parentNode.insertBefore(articlesLink, footerMediaLink.nextSibling);
    }
  }

  // ── 3. Add Substack link to footer ────────────────────────────────────────
  function patchFooterSubstack() {
    const footer = document.querySelector('footer, .site-footer, .footer');
    if (!footer) return;

    const substackExists = Array.from(footer.querySelectorAll('a')).some(function(a) {
      return a.href.includes('substack.com');
    });
    if (substackExists) return;

    let connectBlock = null;
    const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('LONNELL DAWSON WILLIAMS')) {
        connectBlock = node.parentElement;
        break;
      }
    }

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

  // ── 4. Inject mobile CSS fixes ────────────────────────────────────────────
  // Targets issues that can't be fixed with existing page CSS:
  //   - consult-intro-row: missing mobile collapse breakpoint
  //   - #media + #newsletter sections: hardcoded inline padding
  //   - #media-preview-grid: hardcoded 3-column inline grid
  //   - Nav hamburger: tap target below 44px minimum
  //   - General section padding: tighter at 375px
  function injectMobileCSS() {
    // Skip vantage — its React inline styles require JS-level fixes, not CSS overrides
    if (window.location.pathname.includes('vantage')) return;

    // Skip if already injected
    if (document.getElementById('ldw-mobile-patch')) return;

    const style = document.createElement('style');
    style.id = 'ldw-mobile-patch';
    style.textContent = [

      /* ─── Nav hamburger: increase tap target to 44px min ─── */
      /* 11px × 2 + ~26px icon content = 48px ✓ */
      '.site-nav-btn { padding: 11px !important; min-height: 44px !important; min-width: 44px !important; }',

      /* ─── Form inputs: enforce 44px touch target (all pages) ─── */
      /* Fixes select on iOS Safari where -webkit-appearance: none strips height */
      '.form-field input, .form-field select, .form-field textarea,',
      '.audit-input { min-height: 44px !important; }',

      /* ─── 768px: collapse consult-intro-row (missing breakpoint) ─── */
      '@media (max-width: 768px) {',
      '  .consult-intro-row {',
      '    grid-template-columns: 1fr !important;',
      '    gap: 32px !important;',
      '  }',
      '  .consult-stat-grid {',
      '    grid-template-columns: 1fr 1fr !important;',
      '  }',
      '}',

      /* ─── 480px: inline padding overrides + grid fixes ─── */
      '@media (max-width: 480px) {',

      /* section-level inline styles — the 60px padding offenders */
      '  #media { padding: 60px 20px !important; }',
      '  #newsletter { padding: 60px 20px !important; }',

      /* media preview grid: 3-col → 2-col */
      '  #media-preview-grid {',
      '    grid-template-columns: repeat(2, 1fr) !important;',
      '  }',

      /* general section tightening */
      '  .section { padding: 60px 20px !important; }',
      '  .section-inner { padding: 0 20px !important; }',
      '  .hero-inner { padding: 100px 20px 70px !important; }',

      /* speaking cred bar: stay 2-col but tighten */
      '  .cred-bar { padding: 28px 20px !important; }',
      '  .cred-bar-inner { gap: 16px !important; }',

      /* books page: tighten padding */
      '  .vantage-section { padding: 60px 20px !important; }',

      /* consulting: stat numbers can go smaller */
      '  .consult-stat-num { font-size: 32px !important; }',

      /* audit gate: already collapses at 860px but ensure inner padding */
      '  .audit-gate-inner { padding: 28px 20px !important; }',

      /* nav dropdown full-bleed and visible */
      '  .site-nav-links {',
      '    padding: 20px !important;',
      '    gap: 16px !important;',
      '  }',
      '  .site-nav-links a {',
      '    padding: 10px 0 !important;',
      '    font-size: 11px !important;',
      '    letter-spacing: 2px !important;',
      '  }',

      /* footer: tighten at small screens */
      '  .footer { padding: 48px 20px 24px !important; }',
      '  .footer-top { gap: 28px !important; }',

      '}', /* end 480px */

      /* ─── 375px: absolute minimums ─── */
      '@media (max-width: 390px) {',
      '  .section-title, .speak-hero-headline {',
      '    word-break: break-word;',
      '  }',
      '  .site-nav-name { font-size: 14px !important; }',
      '}',

    ].join('\n');

    document.head.appendChild(style);
  }

  // ── Run after DOM is ready ─────────────────────────────────────────────────
  function runPatches() {
    patchTopNav();
    patchFooterNav();
    patchFooterSubstack();
    injectMobileCSS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPatches);
  } else {
    runPatches();
  }

})();
