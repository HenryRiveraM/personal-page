(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const showcase = document.querySelector('[data-work-showcase]');
  if (showcase) {
    const slides = [...showcase.querySelectorAll('[data-work-slide]')];
    const selectors = [...showcase.querySelectorAll('[data-work-select]')];
    const play = showcase.querySelector('[data-work-play]');
    let current = 0;
    let playing = !motion.matches;
    let visible = false;
    let hovered = false;
    let timer;

    function schedule() {
      clearTimeout(timer);
      if (playing && visible && !hovered && !document.hidden) {
        timer = setTimeout(() => { show(current + 1); }, 6500);
      }
    }
    function updatePlay() {
      play.setAttribute('aria-label', playing ? 'Pausar rotación automática' : 'Iniciar rotación automática');
      play.querySelector('[data-play-icon]').textContent = playing ? 'Ⅱ' : '▷';
      play.querySelector('[data-play-label]').textContent = playing ? 'Pausar rotación' : 'Iniciar rotación';
      schedule();
    }
    function stop() { playing = false; updatePlay(); }
    function show(index, manual = false) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.inert = i !== current;
        slide.setAttribute('aria-hidden', String(i !== current));
      });
      selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
      showcase.querySelector('[data-work-position]').textContent = `0${current + 1} / 0${slides.length}`;
      if (manual) {
        stop();
        showcase.querySelector('[data-work-announcement]').textContent = slides[current].getAttribute('aria-label');
      }
      schedule();
    }
    showcase.classList.add('is-enhanced');
    showcase.querySelector('.work-controls').hidden = false;
    showcase.querySelector('.work-selectors').hidden = false;
    show(0);
    updatePlay();
    selectors.forEach((button, i) => button.addEventListener('click', () => show(i, true)));
    showcase.querySelector('[data-work-prev]').addEventListener('click', () => show(current - 1, true));
    showcase.querySelector('[data-work-next]').addEventListener('click', () => show(current + 1, true));
    play.addEventListener('click', () => { playing = !playing; updatePlay(); });
    showcase.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    showcase.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    // Reading or navigating a project must never be interrupted by rotation.
    showcase.addEventListener('focusin', (event) => { if (!play.contains(event.target)) stop(); });
    showcase.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const focusInSlide = slides[current].contains(document.activeElement);
        show(current + (event.key === 'ArrowRight' ? 1 : -1), true);
        if (focusInSlide) slides[current].querySelector('a').focus({ preventScroll: true });
      }
    });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .25 }).observe(showcase);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', () => { if (motion.matches) stop(); });
  }

  const cards = [...document.querySelectorAll('[data-project-card]')];
  if (!cards.length) return;
  const filters = [...document.querySelectorAll('[data-filter]')];
  document.querySelector('[data-gallery-toolbar]').hidden = false;
  function filterProjects(value) {
    let count = 0;
    cards.forEach((card) => {
      card.hidden = value !== 'all' && !card.dataset.category.split(' ').includes(value);
      if (!card.hidden) count++;
    });
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    document.querySelector('[data-filter-count]').textContent = `${count} ${count === 1 ? 'proyecto' : 'proyectos'}`;
  }
  filters.forEach((button) => button.addEventListener('click', () => filterProjects(button.dataset.filter)));

  const dialog = document.querySelector('[data-project-dialog]');
  const content = dialog.querySelector('[data-project-content]');
  const closeButton = dialog.querySelector('[data-project-close]');
  let opener;
  let pushed = false;
  let backdropPressed = false;

  function openProject(card) {
    if (card.hidden) filterProjects('all');
    if (!opener || !card.contains(opener)) opener = card.querySelector('[data-project-open]');
    content.querySelector('video')?.pause();
    content.replaceChildren(card.querySelector('template').content.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('project-open');
    closeButton.focus({ preventScroll: true });
  }
  function syncHash() {
    const card = cards.find((item) => `#${item.id}` === location.hash);
    if (card) openProject(card);
    else if (dialog.open) dialog.close();
  }
  function closeProject() {
    if (pushed) { pushed = false; history.back(); }
    else {
      history.replaceState(null, '', location.pathname + location.search);
      dialog.close();
    }
  }
  document.querySelectorAll('[data-project-open]').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const card = link.closest('[data-project-card]');
      history.pushState(null, '', `#${card.id}`);
      pushed = true;
      openProject(card);
    });
  });
  closeButton.addEventListener('click', closeProject);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeProject(); });
  dialog.addEventListener('pointerdown', (event) => { backdropPressed = event.target === dialog; });
  dialog.addEventListener('click', (event) => { if (backdropPressed && event.target === dialog) closeProject(); backdropPressed = false; });
  dialog.addEventListener('close', () => {
    content.querySelector('video')?.pause();
    document.body.classList.remove('project-open');
    opener?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', syncHash);
  syncHash();
})();
