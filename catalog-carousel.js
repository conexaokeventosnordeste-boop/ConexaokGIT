'use strict';
(() => {
  const track = document.getElementById('catalog-track');
  if (!track) return;
  const section = document.getElementById('locacao-brindes');
  const previous = section.querySelector('.catalog-prev');
  const next = section.querySelector('.catalog-next');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = () => [...track.children].filter(card => card.matches('.catalog-card') && !card.hidden);
  const maximum = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const positions = () => {
    const origin = track.getBoundingClientRect().left;
    return cards().map(card => Math.min(maximum(), Math.max(0, card.getBoundingClientRect().left - origin + track.scrollLeft)));
  };
  function update() {
    const max = maximum();
    previous.hidden = next.hidden = max < 2;
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= max - 2;
  }
  function move(direction) {
    const points = positions();
    const current = track.scrollLeft;
    const target = direction > 0
      ? points.find(point => point > current + 2) ?? maximum()
      : points.reverse().find(point => point < current - 2) ?? 0;
    track.scrollTo({left:target, behavior:motion.matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive:true});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  function refresh() {
    const category = section.querySelector('[data-catalog-filter].active')?.dataset.catalogFilter || 'todos';
    const all = [...track.querySelectorAll('.catalog-card')];
    all.forEach(card => { card.hidden = category !== 'todos' && card.dataset.catalogCategory !== category; });
    const count = section.querySelector('[data-catalog-filter="todos"] span');
    if (count) count.textContent = String(all.length).padStart(2, '0');
    const visible = cards().length;
    document.getElementById('catalog-filter-status').textContent = visible + (visible === 1 ? ' solução encontrada.' : ' soluções encontradas.');
    track.scrollTo({left:0, behavior:'instant'});
    update();
  }
  section.querySelectorAll('[data-catalog-filter]').forEach(button => button.addEventListener('click', refresh));
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update);
  if ('MutationObserver' in window) new MutationObserver(refresh).observe(track, {childList:true});
  refresh();
})();
