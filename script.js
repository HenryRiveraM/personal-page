const root = document.documentElement;
const header = document.querySelector('[data-header]');
const themeButton = document.querySelector('[data-theme-toggle]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const menuLabel = menuButton.querySelector('.sr-only');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const themeColor = document.querySelector('[data-theme-color]');
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];

const savedTheme = localStorage.getItem('theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
root.dataset.theme = savedTheme || preferredTheme;

function updateThemeLabel() {
  const nextTheme = root.dataset.theme === 'dark' ? 'claro' : 'oscuro';
  themeButton.setAttribute('aria-label', `Cambiar a modo ${nextTheme}`);
  themeColor.content = root.dataset.theme === 'dark' ? '#11120f' : '#f4f1ea';
}

updateThemeLabel();
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
  updateThemeLabel();
});

function setMenuState(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  main.inert = open;
  footer.inert = open;
  main.toggleAttribute('aria-hidden', open);
  footer.toggleAttribute('aria-hidden', open);

  if (open) {
    requestAnimationFrame(() => mobileMenu.querySelector('a')?.focus());
  } else if (restoreFocus) {
    menuButton.focus();
  }
}

function closeMenu(restoreFocus = false) {
  setMenuState(false, restoreFocus);
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  setMenuState(!open, open);
});

mobileMenu.addEventListener('click', (event) => {
  if (event.target.matches('a')) closeMenu(false);
});

document.addEventListener('keydown', (event) => {
  const menuOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (event.key === 'Escape' && menuOpen) {
    closeMenu(true);
    return;
  }

  if (event.key === 'Tab' && menuOpen) {
    const focusable = [themeButton, menuButton, ...mobileMenu.querySelectorAll('a')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMenu(false);
});

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 16);
}

let headerFrame = 0;
function scheduleHeaderUpdate() {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    updateHeader();
  });
}

updateHeader();
window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });

const revealElements = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
  root.classList.add('reveal-ready');
}

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver((entries) => {
  const active = entries.find((entry) => entry.isIntersecting);
  if (!active) return;
  navLinks.forEach((link) => {
    const selected = link.getAttribute('href') === `#${active.target.id}`;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const aboutDialog = document.querySelector('#about-card');
const aboutTriggers = document.querySelectorAll('a[href="#sobre-mi"]');
let aboutOpener;

aboutTriggers.forEach((link) => {
  link.setAttribute('aria-haspopup', 'dialog');
  link.setAttribute('aria-controls', 'about-card');
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    aboutOpener = link.closest('.mobile-nav') ? menuButton : link;
    closeMenu(false);
    aboutDialog.showModal();
    document.body.classList.add('about-open');
  });
});

document.querySelector('[data-about-close]').addEventListener('click', () => aboutDialog.close());
// Only dismiss when both ends of the gesture are outside the credential.
let aboutBackdropPressed = false;
aboutDialog.addEventListener('pointerdown', (event) => {
  aboutBackdropPressed = event.target === aboutDialog;
});
aboutDialog.addEventListener('click', (event) => {
  if (aboutBackdropPressed && event.target === aboutDialog) aboutDialog.close();
  aboutBackdropPressed = false;
});
aboutDialog.addEventListener('close', () => {
  document.body.classList.remove('about-open');
  aboutOpener?.focus({ preventScroll: true });
});
