'use strict';
(() => {
  const band = document.getElementById('marcas');
  if (!band) return;
  const track = band.querySelector('.brands-track');
  const copy = band.querySelector('.brands-group').cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  track.append(copy);
  band.classList.add('brands-animated');

  // Suspend only when the tab is hidden; interaction never stops the marquee.
  const updateVisibility = () => band.classList.toggle('brands-paused', Boolean(document.hidden));
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();
})();
