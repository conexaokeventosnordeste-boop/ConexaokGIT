'use strict';
(() => {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('[data-hero-slide]')];
  const stage = carousel.querySelector('.hero-carousel-stage');
  const play = document.getElementById('hero-carousel-play');
  const count = document.getElementById('hero-carousel-count');
  const status = document.getElementById('hero-carousel-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let hovering = false;
  let focused = false;
  let inView = true;
  let timer;
  let touchStart;
  let suppressClickUntil = 0;

  function canPlay() {
    return !paused && !hovering && !focused && inView && !document.hidden && !document.body.classList.contains('modal-open');
  }

  function schedule() {
    clearTimeout(timer);
    if (canPlay()) timer = setTimeout(() => {
      if (canPlay()) show(index + 1);
    }, 5000);
  }

  function show(next, manual = false) {
    const moveFocus = manual && document.activeElement && stage.contains(document.activeElement);
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      const active = current === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.toggleAttribute('inert', !active);
      slide.querySelector('button, a').tabIndex = active ? 0 : -1;
      dots[current].setAttribute('aria-pressed', String(active));
    });
    count.textContent = String(index + 1).padStart(2, '0') + ' — ' + String(slides.length).padStart(2, '0');
    if (moveFocus) slides[index].querySelector('button, a').focus({preventScroll: true});
    if (manual) status.textContent = slides[index].getAttribute('aria-label');
    schedule();
  }

  function updatePlay() {
    if (play) {
      play.setAttribute('aria-label', paused ? 'Retomar passagem automática' : 'Pausar passagem automática');
      play.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    }
    schedule();
  }

  document.getElementById('hero-carousel-prev').addEventListener('click', () => show(index - 1, true));
  document.getElementById('hero-carousel-next').addEventListener('click', () => show(index + 1, true));
  dots.forEach(button => button.addEventListener('click', () => show(Number(button.dataset.heroSlide), true)));
  play?.addEventListener('click', () => { paused = !paused; updatePlay(); });

  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') { hovering = true; schedule(); }
  });
  carousel.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  carousel.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    touchStart = {x: event.clientX, y: event.clientY};
    clearTimeout(timer);
  });
  stage.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch') return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      suppressClickUntil = Date.now() + 800;
      show(index + (dx < 0 ? 1 : -1), true);
    } else schedule();
  });
  stage.addEventListener('pointercancel', () => { touchStart = null; schedule(); });
  stage.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  carousel.addEventListener('click', event => {
    if (event.target.closest('[data-project]')) schedule();
  });

  document.addEventListener('visibilitychange', schedule);
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', schedule));
  motion.addEventListener('change', () => {
    if (motion.matches) paused = true;
    updatePlay();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      schedule();
    }, {threshold: 0.15});
    observer.observe(carousel);
  }

  carousel.querySelector('.hero-carousel-controls').hidden = false;
  updatePlay();
})();
