(() => {
  const photoFix = document.createElement('style');
  photoFix.textContent = `
    img[data-img]{
      background-size:300% 300%!important;
      background-repeat:no-repeat!important;
      background-color:#e8e4dc;
    }
    img[data-img="ring-green-halo.webp"]{background-position:0% 0%!important}
    img[data-img="ring-crystal-cluster.webp"]{background-position:50% 0%!important}
    img[data-img="ring-blue-halo.webp"]{background-position:100% 0%!important}
    img[data-img="ring-peridot-rope.webp"]{background-position:0% 50%!important}
    img[data-img="detail-peridot-scale.webp"]{background-position:50% 50%!important}
    img[data-img="detail-blue-scale.webp"]{background-position:100% 50%!important}
    img[data-img="detail-cluster-profile.webp"]{background-position:0% 100%!important}
    img[data-img="ring-edit-overview.webp"]{background-position:50% 100%!important}
    img[data-img="old-soul-storefront.webp"]{background-position:100% 100%!important}
  `;
  document.head.appendChild(photoFix);

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const close = lightbox?.querySelector('.lightbox-close');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = button.querySelector('img[data-img]');
      if (!lightbox || !lightboxImage || !source) return;
      const style = getComputedStyle(source);
      lightboxImage.removeAttribute('src');
      lightboxImage.style.backgroundImage = style.backgroundImage;
      lightboxImage.style.backgroundSize = style.backgroundSize;
      lightboxImage.style.backgroundPosition = style.backgroundPosition;
      lightboxImage.style.backgroundRepeat = 'no-repeat';
      lightboxImage.alt = source.alt || 'Expanded product view';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      close?.focus();
    });
  });

  close?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
