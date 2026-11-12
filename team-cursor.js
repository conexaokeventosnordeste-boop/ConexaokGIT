(() => {
  const section = document.querySelector('#equipe');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'team-cursor-trail';
  layer.setAttribute('aria-hidden', 'true');
  section.append(layer);
  const letters = [...'conexãokeventos'];
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const colors = ['var(--blue)', 'var(--lime)', '#646471', '#fff'];
  const beads = letters.map((letter, i) => {
    const el = document.createElement('span');
    el.textContent = letter;
    el.style.background = colors[i % colors.length];
    el.style.color = i % 4 === 0 || i % 4 === 2 ? '#fff' : 'var(--ink)';
    layer.append(el);
    return {el, x: 0, y: 0};
  });
  let width = 0, height = 0, visible = false, frame = 0, last = 0, time = 0;
  let pointer = null, moved = -Infinity, initialized = false;
  new ResizeObserver(() => {
    width = section.clientWidth; height = section.clientHeight;
    initialized = false;
  }).observe(section);
  section.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const rect = section.getBoundingClientRect();
    pointer = {x: e.clientX - rect.left, y: e.clientY - rect.top};
    moved = performance.now();
  });
  section.addEventListener('pointerleave', () => { pointer = null; });
  function animate(now) {
    frame = 0;
    if (!visible || reduced.matches || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .04) : 1 / 60;
    last = now; time += dt;
    const size = width < 600 ? 20 : 25;
    const margin = size;
    let target = pointer && now - moved < 1800 ? pointer : {
      x: width * (.5 + .40 * Math.sin(time * .43)),
      y: height * (.45 + .26 * Math.sin(time * .79 + 1.1))
    };
    target = {x: Math.max(margin, Math.min(width - margin, target.x)), y: Math.max(margin, Math.min(height - margin, target.y))};
    if (!initialized) {
      beads.forEach(b => { b.x = target.x; b.y = target.y; });
      initialized = true;
    }
    beads.forEach((b, i) => {
      const lead = i ? beads[i - 1] : target;
      const dx = lead.x - b.x, dy = lead.y - b.y;
      const distance = Math.hypot(dx, dy);
      const gap = i ? size * .90 : 10;
      if (distance > gap) {
        const amount = (1 - Math.exp(-dt * (i ? 17 : 24))) * (distance - gap) / distance;
        b.x += dx * amount; b.y += dy * amount;
      }
      const scale = Math.min(1, Math.max(.12, distance / (size * .8)));
      b.el.style.transform = `translate3d(${b.x}px,${b.y}px,0) translate(-50%,-50%) scale(${scale})`;
    });
    frame = requestAnimationFrame(animate);
  }
  function start() {
    layer.hidden = reduced.matches;
    if (!frame && visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(animate);
  }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; start(); }).observe(section);
  reduced.addEventListener('change', start);
  document.addEventListener('visibilitychange', start);
})();
