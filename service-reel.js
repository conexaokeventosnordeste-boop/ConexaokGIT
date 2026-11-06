'use strict';
(() => {
  const reel = document.querySelector('.service-reel');
  if (!reel) return;
  const track = reel.querySelector('.reel-track');
  const originals = [...track.children];
  const padding = 4;
  const themes = ['blue', 'lime', 'ink', 'paper'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let position = padding;
  let step = 0;
  let visible = false;
  let timer;
  let resetTimer;

  function clone(row) {
    const copy = row.cloneNode(true);
    copy.classList.add('reel-clone');
    copy.querySelector('.reel-word').classList.remove('is-active');
    return copy;
  }
  track.prepend(...originals.slice(-padding).map(clone));
  track.append(...originals.slice(0, padding).map(clone));
  const rows = [...track.children];

  function paint() {
    track.style.setProperty('--reel-position', position);
    reel.dataset.theme = themes[step % themes.length];
    rows.forEach((row, index) => row.querySelector('.reel-word').classList.toggle('is-active', index === position));
  }

  function reset() {
    if (position < padding + originals.length) return;
    reel.classList.add('is-repositioning');
    position = padding;
    paint();
    requestAnimationFrame(() => requestAnimationFrame(() => reel.classList.remove('is-repositioning')));
  }

  function canPlay() {
    return visible && !document.hidden && !reduced.matches;
  }

  function schedule() {
    clearTimeout(timer);
    if (!canPlay()) return;
    timer = setTimeout(() => {
      position += 1;
      step += 1;
      paint();
      if (position === padding + originals.length) {
        clearTimeout(resetTimer);
        resetTimer = setTimeout(reset, 700);
      }
      schedule();
    }, 1800);
  }

  reel.classList.add('is-repositioning');
  paint();
  requestAnimationFrame(() => requestAnimationFrame(() => reel.classList.remove('is-repositioning')));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      schedule();
    }, {threshold: 0.15}).observe(reel);
  } else {
    visible = true;
    schedule();
  }
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
})();
