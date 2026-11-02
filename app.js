'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function initHeroTypewriter() {
    const output = $('.hero-typewriter-output');
    const reserve = $('.hero-typewriter-reserve');
    if (!output || !reserve) return;
    const parts = [...reserve.childNodes];
    const length = parts.reduce((total, part) => total + part.textContent.length, 0);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let count = 0;
    let deleting = false;
    let timer;

    function render(visible, cursor = true) {
      const content = document.createDocumentFragment();
      let remaining = visible;
      for (const part of parts) {
        if (!remaining) break;
        if (part.nodeName === 'BR') {
          content.append(part.cloneNode());
          continue;
        }
        const text = part.textContent.slice(0, remaining);
        const node = part.cloneNode(false);
        node.textContent = text;
        content.append(node);
        remaining -= text.length;
      }
      if (cursor) {
        const caret = document.createElement('span');
        caret.className = 'hero-typewriter-cursor';
        content.append(caret);
      }
      output.replaceChildren(content);
    }

    function tick() {
      if (motion.matches || document.hidden) return;
      count += deleting ? -1 : 1;
      render(count);
      let delay = deleting ? 45 : 95;
      if (count === length) {
        deleting = true;
        delay = 2400;
      } else if (count === 0) {
        deleting = false;
        delay = 650;
      }
      timer = setTimeout(tick, delay);
    }

    function start() {
      clearTimeout(timer);
      count = 0;
      deleting = false;
      render(motion.matches ? length : 0, !motion.matches);
      if (!motion.matches && !document.hidden) timer = setTimeout(tick, 500);
    }

    motion.addEventListener('change', start);
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timer);
      if (!document.hidden && !motion.matches) timer = setTimeout(tick, 500);
    });
    start();
  }
  initHeroTypewriter();

  const PROJECTS = {
    patteo: {
      title: 'Carnaval no Shopping Patteo', category: 'Ativação de marca & experiência', scope: 'Experiência de marcas e trade marketing',
      description: 'O Carnaval no Shopping Patteo reuniu música, artistas e público em uma experiência dentro do shopping. Os registros do portfólio mostram os encontros no espaço da ação, as apresentações e a equipe em campo.',
      images: ['patteo-2.webp', 'patteo-1.webp', 'patteo-3.webp'],
      alts: ['Artistas se apresentam no Carnaval do Shopping Patteo', 'Músico e programação no espaço de Carnaval do Shopping Patteo', 'Equipe reunida no espaço do Carnaval do Shopping Patteo']
    },
    seara: {
      title: 'Super Mix – Seara', category: 'Feira, demonstração & relacionamento', scope: 'Experiência de marcas e trade marketing',
      description: 'A presença da Seara na Super Mix colocou produtos, demonstrações e relacionamento em evidência. A galeria registra o espaço gastronômico, o público acompanhando a programação e a equipe no estande.',
      images: ['seara-1.webp', 'seara-2.webp', 'seara-3.webp'],
      alts: ['Demonstração de produtos no espaço Seara na Super Mix', 'Público acompanha a programação no estande Seara', 'Equipe reunida no estande Seara na Super Mix']
    },
    zelezin: {
      title: 'Show de Zé Lezin', category: 'Show, cultura & encontro', scope: 'Eventos, shows e projetos culturais',
      description: 'O humor de Zé Lezin ganhou o palco em um encontro com o público. As fotografias do portfólio registram o espetáculo, a presença do artista e a experiência de quem acompanhou a apresentação.',
      images: ['ze-lezin-1.webp', 'ze-lezin-2.webp', 'ze-lezin-3.webp'],
      alts: ['Palco e plateia do Show de Zé Lezin', 'Zé Lezin durante sua apresentação no palco', 'Público assiste ao Show de Zé Lezin']
    }
  };
  const STORAGE_KEY = 'xk-eventos-briefing-v1';
  const form = $('#briefing-form');
  const dialog = $('#project-dialog');
  const cultureDialog = $('#culture-dialog');
  const refs = new Set();
  const catalogItems = new Map($$('[data-catalog-item]').map(card => [card.dataset.catalogItem, {
    name: card.dataset.catalogName,
    service: card.dataset.catalogService,
    card
  }]));
  const selectedCatalog = new Set();
  let activeProject = 'seara';
  let imageIndex = 0;
  let currentStep = 1;
  let toastTimer;
  let menuOpen = false;
  let resetArmed = false;

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 4200);
  }
  function setMenu(open) {
    menuOpen = open;
    $('#mobile-menu').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  $('#menu-toggle').addEventListener('click', () => setMenu(!menuOpen));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) { setMenu(false); $('#menu-toggle').focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 900 && menuOpen) setMenu(false); });
  document.addEventListener('click', event => {
    if (menuOpen && !event.target.closest('.header')) setMenu(false);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.desktop-nav a').forEach(link => link.classList.toggle('is-active', link.hash === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-18% 0px -62% 0px' });
    ['sobre', 'servicos', 'locacao-brindes', 'portfolio', 'contato'].forEach(id => observer.observe(document.getElementById(id)));
  }

  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    $$('.filter').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    $$('.project').forEach(project => {
      const visible = category === 'todos' || project.dataset.category === category;
      project.hidden = !visible;
      if (visible) count++;
    });
    $('#filter-status').textContent = count + (count === 1 ? ' projeto encontrado.' : ' projetos encontrados.');
  }));

  function updateGallery() {
    const project = PROJECTS[activeProject];
    const image = $('#gallery-image');
    image.src = 'assets/' + project.images[imageIndex];
    image.alt = project.alts[imageIndex];
    $('#gallery-count').textContent = (imageIndex + 1) + ' / ' + project.images.length;
    $$('#gallery-thumbs button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === imageIndex)));
  }
  function showProject(id) {
    if (!PROJECTS[id]) return;
    activeProject = id;
    imageIndex = 0;
    const project = PROJECTS[id];
    $('#dialog-title').textContent = project.title;
    $('#dialog-category').textContent = project.category;
    $('#dialog-description').textContent = project.description;
    $('#dialog-scope').textContent = project.scope;
    const thumbs = $('#gallery-thumbs');
    thumbs.replaceChildren();
    project.images.forEach((file, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Ver fotografia ' + (index + 1) + ': ' + project.alts[index]);
      button.setAttribute('aria-pressed', String(index === 0));
      const img = document.createElement('img');
      img.src = 'assets/' + file;
      img.alt = '';
      button.append(img);
      button.addEventListener('click', () => { imageIndex = index; updateGallery(); });
      thumbs.append(button);
    });
    updateGallery();
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('[data-project]').forEach(button => button.addEventListener('click', () => showProject(button.dataset.project)));
  $('#close-project').addEventListener('click', () => dialog.close());
  $('#gallery-prev').addEventListener('click', () => { imageIndex = (imageIndex + PROJECTS[activeProject].images.length - 1) % PROJECTS[activeProject].images.length; updateGallery(); });
  $('#gallery-next').addEventListener('click', () => { imageIndex = (imageIndex + 1) % PROJECTS[activeProject].images.length; updateGallery(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); $('#gallery-prev').click(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); $('#gallery-next').click(); }
  });
  [dialog, cultureDialog].forEach(element => {
    element.addEventListener('close', () => document.body.classList.remove('modal-open'));
    element.addEventListener('click', event => {
      if (event.target !== element) return;
      const rect = element.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) element.close();
    });
  });
  $('#junino-open').addEventListener('click', () => { cultureDialog.showModal(); document.body.classList.add('modal-open'); });
  $('#close-culture').addEventListener('click', () => cultureDialog.close());
  $('#culture-briefing').addEventListener('click', () => {
    selectService('Eventos, shows e projetos culturais');
    refs.add('Projetos de São João');
    updateRefs();
    cultureDialog.close();
    goToBriefing();
    toast('Projeto cultural incluído no seu briefing.');
  });

  function selectService(service) {
    const input = $$('input[name="services"]', form).find(input => input.value === service);
    if (input) input.checked = true;
    $('#services-error').hidden = true;
  }
  function goToBriefing() {
    showStep(1, false);
    document.getElementById('orcamento').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  $$('[data-service]').forEach(button => button.addEventListener('click', () => {
    selectService(button.dataset.service);
    goToBriefing();
    toast('Solução incluída. Conte mais sobre o seu projeto.');
  }));

  $$('[data-catalog-filter]').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.catalogFilter;
    $$('[data-catalog-filter]').forEach(filter => {
      filter.classList.toggle('active', filter === button);
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    let count = 0;
    catalogItems.forEach(item => {
      item.card.hidden = category !== 'todos' && item.card.dataset.catalogCategory !== category;
      if (!item.card.hidden) count++;
    });
    $('#catalog-filter-status').textContent = count + (count === 1 ? ' solução encontrada.' : ' soluções encontradas.');
  }));

  function updateCatalogSelection() {
    const container = $('#catalog-selection-chips');
    container.replaceChildren();
    $('#catalog-selection').hidden = selectedCatalog.size === 0;
    catalogItems.forEach((item, id) => {
      const selected = selectedCatalog.has(id);
      const button = $('[data-catalog-add]', item.card);
      button.dataset.selected = String(selected);
      button.setAttribute('aria-label', (selected ? 'Ver ' : 'Incluir ') + item.name + ' no orçamento');
      $('.catalog-add-text', button).textContent = selected ? 'No seu orçamento ✓' : 'Incluir no orçamento';
    });
    selectedCatalog.forEach(id => {
      const item = catalogItems.get(id);
      const chip = document.createElement('span');
      chip.className = 'reference-chip';
      chip.append(document.createTextNode(item.name));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover ' + item.name + ' do orçamento');
      remove.addEventListener('click', () => {
        selectedCatalog.delete(id);
        updateCatalogSelection();
        (container.querySelector('button') || $('#form-step-1')).focus();
      });
      chip.append(remove);
      container.append(chip);
    });
  }
  $$('[data-catalog-add]').forEach(button => button.addEventListener('click', () => {
    const id = button.closest('[data-catalog-item]').dataset.catalogItem;
    const item = catalogItems.get(id);
    selectedCatalog.add(id);
    selectService(item.service);
    updateCatalogSelection();
    goToBriefing();
    $('#form-step-1').focus({preventScroll: true});
    toast(item.name + ' incluído no orçamento. Informe as quantidades e preferências nos detalhes.');
  }));
  function updateRefs() {
    const container = $('#reference-chips');
    container.replaceChildren();
    $('#project-references').hidden = refs.size === 0;
    refs.forEach(reference => {
      const chip = document.createElement('span');
      chip.className = 'reference-chip';
      chip.append(document.createTextNode(reference));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover referência ' + reference);
      remove.addEventListener('click', () => { refs.delete(reference); updateRefs(); });
      chip.append(remove);
      container.append(chip);
    });
  }
  $('#add-project-reference').addEventListener('click', () => {
    const project = PROJECTS[activeProject];
    refs.add(project.title);
    selectService(project.scope);
    updateRefs();
    dialog.close();
    goToBriefing();
    toast('Referência adicionada ao seu briefing.');
  });
  function selectedServices() { return $$('input[name="services"]:checked', form).map(input => input.value); }
  function showStep(step, focus = true) {
    currentStep = step;
    $$('.form-step').forEach(element => { element.hidden = Number(element.dataset.step) !== step; });
    $$('[data-step-label]').forEach(element => {
      const index = Number(element.dataset.stepLabel);
      element.classList.toggle('current', index === step);
      element.classList.toggle('done', index < step);
      if (index === step) element.setAttribute('aria-current', 'step');
      else element.removeAttribute('aria-current');
    });
    if (focus) $('#form-step-' + step).focus();
  }
  function clearErrors(step) {
    $('#step-' + step + '-error').hidden = true;
    $$('.form-step[data-step="' + step + '"] [aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  }
  function validateStep(step) {
    clearErrors(step);
    const section = $('.form-step[data-step="' + step + '"]');
    const errors = [];
    let firstInvalid = null;
    if (step === 1) {
      const missing = selectedServices().length === 0;
      $('#services-error').hidden = !missing;
      if (missing) { errors.push('Selecione uma solução.'); firstInvalid = $('input[name="services"]'); }
    }
    $$('input,select,textarea', section).forEach(field => {
      if (field.type === 'checkbox') return;
      if (field.required && !field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
        if (field.name === 'project') errors.push('Informe o nome ou tipo do projeto.');
        else if (field.name === 'city') errors.push('Informe a cidade e o estado.');
        else if (field.name === 'name') errors.push('Informe seu nome.');
      } else if (!field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
        if (field.type === 'email') errors.push('Confira o formato do e-mail.');
        else if (field.name === 'guests') errors.push('Informe um público entre 1 e 10.000.000 de pessoas.');
        else errors.push('Confira o campo destacado.');
      }
    });
    if (errors.length) {
      const error = $('#step-' + step + '-error');
      error.textContent = errors.join(' ');
      error.hidden = false;
      firstInvalid?.focus();
      return false;
    }
    return true;
  }
  $$('[data-next]').forEach(button => button.addEventListener('click', () => {
    if (validateStep(currentStep)) showStep(Number(button.dataset.next));
  }));
  $$('[data-back]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.back))));
  form.addEventListener('input', event => {
    if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
    if (event.target.name === 'services' && selectedServices().length) $('#services-error').hidden = true;
    if (event.target.name === 'services' && !event.target.checked) {
      catalogItems.forEach((item, id) => {
        if (item.service === event.target.value) selectedCatalog.delete(id);
      });
      updateCatalogSelection();
    }
    resetArmed = false;
    $('#reset-briefing').textContent = 'Novo briefing';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (currentStep === 1) { if (validateStep(1)) showStep(2); return; }
    if (!validateStep(1)) { showStep(1, false); return; }
    if (!validateStep(2)) { showStep(2, false); return; }
    renderSummary();
    showStep(3);
  });
  function formData() {
    const values = {};
    $$('input,select,textarea', form).forEach(field => {
      if (field.name && field.name !== 'services') values[field.name] = field.value.trim();
    });
    return { values, services: selectedServices(), references: [...refs], items: [...selectedCatalog] };
  }
  function summaryRows() {
    const { values, services, references, items } = formData();
    const date = values.date ? values.date.split('-').reverse().join('/') : 'A definir';
    return [
      ['Projeto', values.project], ['Soluções', services.join(' · ')], ['Cidade / UF', values.city], ['Data prevista', date],
      ['Itens de locação e brindes', items.map(id => catalogItems.get(id).name).join(' · ')],
      ['Nome', values.name], ['Empresa', values.company], ['E-mail', values.email], ['Telefone', values.phone],
      ['Público estimado', values.guests ? values.guests + ' pessoas' : 'A definir'], ['Investimento previsto', values.budget],
      ['Referências do portfólio', references.join(' · ')], ['Sobre o projeto', values.details]
    ].filter(([, value]) => value);
  }
  function renderSummary() {
    const summary = $('#briefing-summary');
    summary.replaceChildren();
    summaryRows().forEach(([label, value]) => {
      const row = document.createElement('div');
      const title = document.createElement('dt');
      const description = document.createElement('dd');
      title.textContent = label;
      description.textContent = value;
      row.append(title, description);
      summary.append(row);
    });
    $('#copy-status').textContent = '';
    $('#copy-fallback').hidden = true;
  }
  function briefingText() {
    return 'XK EVENTOS | BRIEFING DO PROJETO\n\n' + summaryRows().map(([label, value]) => label + ': ' + value).join('\n\n') + '\n\nBriefing preparado pelo visitante. Nenhuma informação foi enviada automaticamente.\n';
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (_) { /* Continue with a browser-local fallback. */ }
    const area = document.createElement('textarea');
    area.value = text;
    area.className = 'sr-only';
    document.body.append(area);
    area.focus();
    area.select();
    let result = false;
    try { result = document.execCommand('copy'); } catch (_) { /* Let the visitor copy manually. */ }
    area.remove();
    return result;
  }
  $('#copy-briefing').addEventListener('click', async () => {
    const text = briefingText();
    const copied = await copyText(text);
    $('#copy-status').textContent = copied ? 'Briefing copiado. Você decide quando e como compartilhar.' : 'A cópia automática não está disponível. Selecione o texto abaixo para copiar.';
    $('#copy-fallback').hidden = copied;
    if (!copied) { $('#copy-fallback-text').value = text; $('#copy-fallback-text').focus(); $('#copy-fallback-text').select(); }
  });
  $('#download-briefing').addEventListener('click', () => {
    const blob = new Blob(['\uFEFF' + briefingText()], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'briefing-xk-eventos.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    $('#copy-status').textContent = 'Briefing preparado para download. Nenhum dado foi enviado.';
  });
  function hasDraft() { try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch (_) { return false; } }
  function updateDraftButtons() {
    const exists = hasDraft();
    $('#load-draft').hidden = !exists;
    $('#delete-draft').hidden = !exists;
  }
  $('#save-draft').addEventListener('click', () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...formData() }));
      updateDraftButtons();
      toast('Rascunho salvo somente neste navegador.');
    } catch (_) { toast('Não foi possível salvar neste navegador. Você pode continuar e baixar o briefing.'); }
  });
  $('#load-draft').addEventListener('click', () => {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!draft || draft.version !== 1 || !draft.values || !Array.isArray(draft.services) || !Array.isArray(draft.references)) throw new Error('invalid draft');
      form.reset();
      Object.entries(draft.values).forEach(([key, value]) => {
        const field = [...form.elements].find(item => item.name === key && item.name !== 'services');
        if (field && typeof value === 'string') field.value = value.slice(0, 4000);
      });
      draft.services.forEach(service => selectService(service));
      selectedCatalog.clear();
      if (Array.isArray(draft.items)) draft.items.forEach(id => {
        if (catalogItems.has(id)) {
          selectedCatalog.add(id);
          selectService(catalogItems.get(id).service);
        }
      });
      updateCatalogSelection();
      refs.clear();
      const allowedRefs = new Set([...Object.values(PROJECTS).map(project => project.title), 'Projetos de São João']);
      draft.references.forEach(reference => { if (allowedRefs.has(reference)) refs.add(reference); });
      updateRefs(); clearErrors(1); clearErrors(2); $('#services-error').hidden = true;
      showStep(1);
      toast('Rascunho recuperado. Revise as informações antes de concluir.');
    } catch (_) { toast('Não foi possível recuperar este rascunho.'); }
  });
  $('#delete-draft').addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE_KEY); updateDraftButtons(); toast('Rascunho salvo excluído deste navegador.'); }
    catch (_) { toast('Não foi possível excluir o rascunho neste navegador.'); }
  });
  $('#reset-briefing').addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      $('#reset-briefing').textContent = 'Confirmar novo briefing';
      toast('Clique novamente para limpar o formulário atual. O rascunho salvo permanece disponível.');
      return;
    }
    form.reset(); refs.clear(); updateRefs(); selectedCatalog.clear(); updateCatalogSelection(); clearErrors(1); clearErrors(2);
    $('#services-error').hidden = true;
    resetArmed = false; $('#reset-briefing').textContent = 'Novo briefing';
    showStep(1);
    toast('Novo briefing iniciado.');
  });
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const copied = await copyText(button.dataset.copy);
    toast(copied ? 'Contato copiado. Nenhuma mensagem foi enviada.' : 'Selecione o contato na tela e copie manualmente.');
  }));
  $('#year').textContent = new Date().getFullYear();
  updateDraftButtons();
})();
