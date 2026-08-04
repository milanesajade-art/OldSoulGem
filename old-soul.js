(() => {
  const DIRECT_PRODUCTS = {
    'Wire-Wrapped Crystal Earrings': {
      id: 'osg-earrings-amethyst',
      name: 'Wire-Wrapped Crystal Earrings',
      price: 28,
      priceLabel: '$28.00',
      stripePaymentLink: '',
      etsyUrl: 'https://www.etsy.com/listing/4356782794/handmade-wire-wrapped-crystal-earrings'
    },
    'Chakra Bracelet Collection': {
      id: 'osg-chakra-bracelets',
      name: 'Chakra Bracelet Collection',
      price: 25,
      priceLabel: 'From $25.00',
      stripePaymentLink: '',
      etsyUrl: 'https://www.etsy.com/listing/4442388030/chakra-bracelet-collection-root-to-crown'
    },
    'Mystery Crystal Charm Bracelet': {
      id: 'osg-mystery-charm-bracelet',
      name: 'Mystery Crystal Charm Bracelet',
      price: 20,
      priceLabel: 'From $20.00',
      stripePaymentLink: '',
      etsyUrl: 'https://www.etsy.com/shop/OldSoulGemGND'
    },
    'Vintage Jewelry & Treasures': {
      id: 'osg-vintage-treasures',
      name: 'Vintage Jewelry & Treasures',
      price: null,
      priceLabel: 'One of one',
      stripePaymentLink: '',
      etsyUrl: 'https://www.etsy.com/shop/OldSoulGemGND'
    }
  };

  const CHECKOUT_EMAIL = 'oldsoulgemsand@gmail.com';
  const CHECKOUT_RETURN_URL = 'https://milanesajade-art.github.io/thevidacollection/checkout-success.html';

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));

  function isStripePaymentLink(url = '') {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(parsed.hostname);
    } catch {
      return false;
    }
  }

  function loadImages() {
    document.querySelectorAll('[data-img]').forEach((img) => {
      const src = window.OSG_IMAGES?.[img.dataset.img];
      if (src) img.src = src;
    });
  }

  function bindNavigation() {
    const menuButton = document.querySelector('.menu-button');
    const nav = document.querySelector('#site-nav');
    menuButton?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav?.querySelectorAll('a').forEach((anchor) => anchor.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    }));
  }

  function bindFilters() {
    const filters = [...document.querySelectorAll('.filter')];
    const cards = [...document.querySelectorAll('.product-card')];
    function applyFilter(name) {
      filters.forEach((button) => button.classList.toggle('active', button.dataset.filter === name));
      cards.forEach((card) => { card.hidden = name !== 'all' && card.dataset.category !== name; });
    }
    filters.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
    document.querySelectorAll('[data-jump-filter]').forEach((link) => link.addEventListener('click', () => {
      applyFilter(link.dataset.jumpFilter);
    }));
  }

  function addCheckoutStylesheet() {
    if (document.querySelector('link[data-direct-checkout-styles]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'direct-checkout.css?v=1';
    stylesheet.dataset.directCheckoutStyles = 'true';
    document.head.appendChild(stylesheet);
  }

  function updateStorefrontMessaging() {
    const announcement = document.querySelector('.announcement');
    if (announcement) {
      announcement.innerHTML = `
        <p><strong>Shop directly with Old Soul Gem.</strong> Reserve a piece here, then complete card payment through a secure Stripe checkout link. Etsy remains available as an optional backup.</p>
        <a href="#shop">Shop direct ↓</a>`;
    }

    const navShop = document.querySelector('.nav-shop');
    if (navShop) {
      navShop.href = '#shop';
      navShop.textContent = 'Buy Direct';
      navShop.removeAttribute('target');
      navShop.removeAttribute('rel');
    }
  }

  function createCheckoutDialog() {
    if (document.getElementById('directCheckoutDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'directCheckoutDialog';
    dialog.className = 'direct-checkout-dialog';
    dialog.setAttribute('aria-labelledby', 'directCheckoutTitle');
    dialog.innerHTML = `
      <div class="direct-checkout-panel">
        <button class="direct-checkout-close" type="button" aria-label="Close checkout">×</button>
        <p class="direct-checkout-kicker">Old Soul Gem direct checkout</p>
        <h2 id="directCheckoutTitle">Reserve your piece</h2>
        <div class="direct-checkout-summary">
          <div>
            <span>Selected piece</span>
            <strong data-checkout-product></strong>
          </div>
          <strong data-checkout-price></strong>
        </div>
        <p class="direct-checkout-note" data-checkout-note></p>
        <a class="button button-dark direct-stripe-link" data-stripe-link hidden rel="noopener">Continue to secure payment</a>
        <form class="direct-order-form" data-direct-order-form action="https://formsubmit.co/${CHECKOUT_EMAIL}" method="POST">
          <input type="hidden" name="_subject" data-order-subject>
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_next" value="${CHECKOUT_RETURN_URL}">
          <input type="text" name="_honey" class="honeypot" tabindex="-1" autocomplete="off">
          <input type="hidden" name="product" data-order-product>
          <input type="hidden" name="listed_price" data-order-price>
          <input type="hidden" name="checkout_status" value="Secure payment link requested">
          <label>Name<input name="name" autocomplete="name" required></label>
          <label>Email<input type="email" name="email" autocomplete="email" required></label>
          <label>Phone <span>(optional)</span><input name="phone" autocomplete="tel"></label>
          <label>Size, color, or notes <span>(optional)</span><textarea name="order_notes" rows="3" placeholder="Add bracelet size, stone preference, delivery question, or other details."></textarea></label>
          <button class="button button-dark" type="submit">Reserve & request secure payment</button>
        </form>
        <p class="direct-checkout-security">Card information is never entered or stored on this website. Stripe will handle the secure payment page after activation.</p>
        <a class="direct-etsy-fallback" data-etsy-fallback target="_blank" rel="noopener">Prefer Etsy? View the listing ↗</a>
      </div>`;
    document.body.appendChild(dialog);

    dialog.querySelector('.direct-checkout-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function openCheckout(product) {
    const dialog = document.getElementById('directCheckoutDialog');
    if (!dialog || !product) return;

    const productName = dialog.querySelector('[data-checkout-product]');
    const productPrice = dialog.querySelector('[data-checkout-price]');
    const note = dialog.querySelector('[data-checkout-note]');
    const stripeLink = dialog.querySelector('[data-stripe-link]');
    const orderForm = dialog.querySelector('[data-direct-order-form]');
    const etsyFallback = dialog.querySelector('[data-etsy-fallback]');

    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = product.priceLabel;
    if (etsyFallback) etsyFallback.href = product.etsyUrl;

    dialog.querySelector('[data-order-subject]').value = `Direct order request: ${product.name}`;
    dialog.querySelector('[data-order-product]').value = `${product.name} (${product.id})`;
    dialog.querySelector('[data-order-price]').value = product.priceLabel;

    if (isStripePaymentLink(product.stripePaymentLink)) {
      if (note) note.textContent = 'Review the piece, then continue to Stripe for secure payment, shipping details, and your receipt.';
      stripeLink.href = product.stripePaymentLink;
      stripeLink.hidden = false;
      orderForm.hidden = true;
    } else {
      if (note) note.textContent = 'Submit this short checkout request and Old Soul Gem will confirm availability and send the secure payment link directly.';
      stripeLink.hidden = true;
      stripeLink.removeAttribute('href');
      orderForm.hidden = false;
    }

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function decorateProductCards() {
    document.querySelectorAll('.product-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent.trim();
      const product = DIRECT_PRODUCTS[title];
      const bottom = card.querySelector('.product-bottom');
      if (!product || !bottom) return;

      card.dataset.directProductId = product.id;
      const cardLinks = [card.querySelector('.product-image'), card.querySelector('h3 a')].filter(Boolean);
      cardLinks.forEach((link) => {
        link.href = '#shop';
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.setAttribute('aria-label', `${product.name} — open direct checkout`);
        link.addEventListener('click', (event) => {
          event.preventDefault();
          openCheckout(product);
        });
      });

      const originalLink = bottom.querySelector('a');
      const etsyUrl = originalLink?.href || product.etsyUrl;
      product.etsyUrl = etsyUrl;
      originalLink?.remove();

      const actions = document.createElement('div');
      actions.className = 'direct-purchase-actions';
      actions.innerHTML = `
        <button class="direct-buy-button" type="button">${product.price === null ? 'Reserve direct' : 'Buy direct'}</button>
        <a href="${escapeHtml(etsyUrl)}" target="_blank" rel="noopener">Etsy backup ↗</a>`;
      actions.querySelector('button')?.addEventListener('click', () => openCheckout(product));
      bottom.appendChild(actions);
    });
  }

  function updateYear() {
    const year = document.querySelector('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function init() {
    loadImages();
    bindNavigation();
    bindFilters();
    addCheckoutStylesheet();
    updateStorefrontMessaging();
    createCheckoutDialog();
    decorateProductCards();
    updateYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();