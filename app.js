(() => {
  const carousel = document.querySelector('[data-carousel]');
  const slides = [...document.querySelectorAll('[data-slide]')];
  const current = document.querySelector('[data-current]');
  const progress = document.querySelector('[data-progress]');
  const pauseButton = document.querySelector('[data-pause]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let paused = reduceMotion;
  let timer;

  const header = document.querySelector('[data-header]');
  const year = document.querySelector('[data-year]');
  if (header) {
    addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 80), {passive:true});
  }
  if (year) year.textContent = new Date().getFullYear();

  /* Interior pages share this file but do not include the homepage carousel. */
  if (!carousel || !slides.length || !current || !progress || !pauseButton) return;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a, button').forEach(el => el.tabIndex = active ? 0 : -1);
    });
    current.textContent = String(index + 1).padStart(2, '0');
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  }

  function schedule() {
    clearInterval(timer);
    if (!paused) timer = setInterval(() => show(index + 1), 7000);
  }

  document.querySelector('[data-prev]').addEventListener('click', () => { show(index - 1); schedule(); });
  document.querySelector('[data-next]').addEventListener('click', () => { show(index + 1); schedule(); });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? '繼續輪播' : '暫停輪播');
    schedule();
  });
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', schedule);
  carousel.addEventListener('focusin', () => clearInterval(timer));
  carousel.addEventListener('focusout', schedule);
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : schedule());

  let touchStart = 0;
  carousel.addEventListener('touchstart', event => touchStart = event.changedTouches[0].clientX, {passive:true});
  carousel.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
    schedule();
  }, {passive:true});

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menu) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }

  show(0);
  if (reduceMotion) { pauseButton.textContent = '▶'; pauseButton.setAttribute('aria-label', '繼續輪播'); }
  schedule();
})();
