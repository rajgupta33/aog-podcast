/**
 * Shared site utilities for Attitude of Gratitude Podcast (https://attitude-ofgratitude.com/)
 * Restored to prevent 404 errors on cached pages and provide shared analytics helpers.
 */
(function () {
  window.dataLayer = window.dataLayer || [];

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
