(() => {
  document.querySelectorAll('[data-img]').forEach(img => { const src = window.OSG_IMAGES?.[img.dataset.img]; if (src) img.src = src; });
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const filters = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.product-card')];
  function applyFilter(name) {
    filters.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === name));
    cards.forEach(card => card.hidden = name !== 'all' && card.dataset.category !== name);
  }
  filters.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
  document.querySelectorAll('[data-jump-filter]').forEach(link => link.addEventListener('click', () => {
    applyFilter(link.dataset.jumpFilter);
  }));
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
