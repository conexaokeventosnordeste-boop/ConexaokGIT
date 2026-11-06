'use strict';
(() => {
  const video = document.querySelector('.process-motion');
  if (!video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  video.muted = true;
  function sync() {
    if (!visible || document.hidden || reduced.matches) video.pause();
    else video.play().catch(() => {});
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    }, {threshold: 0.05}).observe(video.parentElement);
  } else {
    visible = true;
  }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
