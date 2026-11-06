'use strict';
(() => {
  const track = document.getElementById('team-track');
  if (!track) return;
  const section = document.getElementById('equipe');
  const controls = section.querySelector('.team-controls');
  const previous = section.querySelector('.team-previous');
  const next = section.querySelector('.team-next');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
  function update() {
    controls.hidden = maximum() < 2;
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= maximum() - 2;
  }
  function scrollTo(left) {
    track.scrollTo({left, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  function move(direction) {
    const origin = track.getBoundingClientRect().left;
    const points = [...track.children].map(card => Math.min(maximum(), Math.max(0, card.getBoundingClientRect().left - origin + track.scrollLeft)));
    const current = track.scrollLeft;
    scrollTo(direction > 0
      ? points.find(point => point > current + 2) ?? maximum()
      : points.reverse().find(point => point < current - 2) ?? 0);
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive: true});
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') scrollTo(0);
    else if (event.key === 'End') scrollTo(maximum());
    else move(event.key === 'ArrowRight' ? 1 : -1);
  });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update);
  update();
})();
