'use strict';
(() => {
  const widget = document.querySelector('.welcome-chat');
  const panel = widget.querySelector('.welcome-chat-panel');
  const toggle = widget.querySelector('.welcome-chat-toggle');
  const minimize = panel.querySelector('.icon-button');
  const form = panel.querySelector('form');
  const message = form.querySelector('textarea');
  const sessionKey = 'xk-atendimento-minimizado';

  function setOpen(open) {
    panel.hidden = !open;
    toggle.hidden = open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  function collapse(focusToggle) {
    setOpen(false);
    try { sessionStorage.setItem(sessionKey, '1'); } catch {}
    if (focusToggle) toggle.focus();
  }

  let minimized = false;
  try { minimized = sessionStorage.getItem(sessionKey) === '1'; } catch {}
  setOpen(!minimized);

  toggle.addEventListener('click', () => {
    setOpen(true);
    message.focus();
  });
  minimize.addEventListener('click', () => collapse(true));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') collapse(true);
  });
  message.addEventListener('input', () => message.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = message.value.trim();
    if (!text) {
      message.setCustomValidity('Escreva sua mensagem para continuar.');
      message.reportValidity();
      return;
    }
    const url = new URL('https://wa.me/5511995095970');
    url.searchParams.set('text', text);
    window.open(url.href, '_blank', 'noopener,noreferrer');
    collapse(true);
  });
})();
