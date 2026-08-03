(function () {
  function initTimestampToggles() {
    document.querySelectorAll('.ep-timestamps').forEach(function (section) {
      if (section.dataset.timestampToggleReady === 'true') return;

      var list = section.querySelector('.timestamp-list');
      if (!list) return;

      section.dataset.timestampToggleReady = 'true';
      section.classList.add('timestamps-collapsible');

      list.querySelectorAll('.ts-extra').forEach(function (item) {
        item.classList.remove('ts-extra');
        item.style.display = '';
      });

      section.querySelectorAll('button[onclick*="ts-extra"]').forEach(function (button) {
        var wrapper = button.parentElement;
        if (wrapper && wrapper.children.length === 1) wrapper.remove();
        else button.remove();
      });

      var toggleWrap = document.createElement('div');
      toggleWrap.className = 'timestamp-toggle-wrap';

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'button-outline button-small timestamp-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Read More';

      toggle.addEventListener('click', function () {
        var expanded = section.classList.toggle('timestamps-expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? 'Read Less' : 'Read More';
      });

      toggleWrap.appendChild(toggle);
      list.insertAdjacentElement('afterend', toggleWrap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimestampToggles);
  } else {
    initTimestampToggles();
  }
})();
