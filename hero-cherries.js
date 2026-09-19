// All motion stays inside the decorative hero visual.
(() => {
  const stage = document.querySelector('[data-cherries]');
  if (!stage) return;

  const hero = stage.closest('.hero');
  const scrollLayer = stage.querySelector('[data-cherries-scroll]');
  const cursorLayer = stage.querySelector('[data-cherries-cursor]');
  const image = stage.querySelector('img');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactLayout = window.matchMedia('(max-width: 900px)');
  const smallScreen = window.matchMedia('(max-width: 640px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);
  let start = 0;
  let end = 1;
  let frame = 0;
  let needsMeasure = true;
  let pointerX = 0;
  let pointerY = 0;

  // This outer box never transforms, so resize measurements cannot feed back
  // into the scroll motion or cause position jumps.
  function measure() {
    const heroBox = hero.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const top = window.scrollY;
    const travel = smallScreen.matches ? 24 : compactLayout.matches ? 48 : 120;
    start = compactLayout.matches
      ? Math.max(heroBox.top + top, stageBox.top + top - window.innerHeight * .72)
      : heroBox.top + top;
    end = Math.max(start + 1, top + Math.min(heroBox.bottom, stageBox.bottom + travel));
    needsMeasure = false;
  }

  function render() {
    frame = 0;
    if (needsMeasure) measure();

    if (reducedMotion.matches) {
      scrollLayer.style.removeProperty('transform');
      scrollLayer.style.removeProperty('opacity');
      cursorLayer.style.removeProperty('--cherry-x');
      cursorLayer.style.removeProperty('--cherry-y');
      return;
    }

    const progress = clamp((window.scrollY - start) / (end - start));
    const eased = smoothstep(progress);
    const travel = smallScreen.matches ? 24 : compactLayout.matches ? 48 : 120;
    const rotation = smallScreen.matches ? 2 : compactLayout.matches ? 4 : 8;
    const shrink = smallScreen.matches ? .015 : .06;
    const opacity = 1 - smoothstep(clamp((progress - .45) / .55));

    // Pure scroll progress makes forward and reverse motion identical.
    // Separate layers keep entrance, scroll and cursor transforms independent.
    scrollLayer.style.transform = `translate3d(0, ${travel * eased}px, 0) rotate(${rotation * eased}deg) scale(${1 - shrink * eased})`;
    scrollLayer.style.opacity = String(opacity);
    cursorLayer.style.setProperty('--cherry-x', `${pointerX}px`);
    cursorLayer.style.setProperty('--cherry-y', `${pointerY}px`);
  }

  function requestRender() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function resetPointer() {
    pointerX = 0;
    pointerY = 0;
    requestRender();
  }

  function refresh() {
    needsMeasure = true;
    resetPointer();
  }

  stage.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    const box = stage.getBoundingClientRect();
    pointerX = clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1) * 8;
    pointerY = clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1) * 8;
    requestRender();
  });
  stage.addEventListener('pointerleave', resetPointer);
  stage.addEventListener('pointercancel', resetPointer);
  window.addEventListener('blur', resetPointer);
  window.addEventListener('scroll', resetPointer, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);
  [reducedMotion, compactLayout, smallScreen, finePointer].forEach((query) => {
    query.addEventListener('change', refresh);
  });
  const resizeObserver = new ResizeObserver(refresh);
  resizeObserver.observe(hero);
  resizeObserver.observe(stage);

  // Wait for the actual asset, so a slow image request never misses the entrance.
  stage.classList.add('is-loading');
  function reveal() {
    stage.classList.remove('is-loading');
    stage.classList.add('is-ready');
    refresh();
  }
  image.decode().then(reveal, reveal);
  document.fonts.ready.then(refresh);
  requestRender();
})();
