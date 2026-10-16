/**
 * Shared site utilities for Attitude of Gratitude Podcast (https://attitude-ofgratitude.com/)
 * Restored to prevent 404 errors on cached pages and provide shared analytics helpers.
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  function initializeNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    links.id = links.id || 'site-navigation';
    toggle.setAttribute('aria-controls', links.id);
    function setOpen(open) {
      links.classList.toggle('open', open);
      document.documentElement.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.focus();
      } else if (event.key === 'Tab') {
        var items = [toggle].concat(Array.from(links.querySelectorAll('a[href]')));
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
  } else {
    initializeNavigation();
  }

  // Track outbound WhatsApp and Email clicks for conversion funnel attribution (non-PII)
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('whatsapp.com') !== -1 || href.indexOf('wa.me') !== -1) {
      window.dataLayer.push({
        event: 'click_whatsapp',
        page_path: window.location.pathname
      });
    } else if (href.indexOf('mailto:') === 0) {
      window.dataLayer.push({
        event: 'click_email',
        page_path: window.location.pathname
      });
    }
  });
})();
