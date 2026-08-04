(() => {
  const PREVIEW_KEY = 'vida_creator_preview_v2';
  const ETSY_SHOP = 'https://www.etsy.com/shop/OldSoulGemGND';
  const defaults = Array.isArray(window.VIDA_COLLECTION_DEFAULTS) ? window.VIDA_COLLECTION_DEFAULTS : [];
  const galleries = window.VIDA_PRODUCT_GALLERIES || {};
  const params = new URLSearchParams(location.search);
  const previewMode = params.has('preview');
  const read = () => { if (!previewMode) return null; try { return JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch { return null; } };
  const pieces = () => Array.isArray(read()?.pieces) ? read().pieces : defaults;
  const id = params.get('id');
  const piece = pieces().find((p) => p.id === id);
  const set = (id, value) => { const el = document.getElementById(id); if (el && value != null) el.textContent = value; };
  const inquiryLink = (interest) => `index.html?interest=${encodeURIComponent(interest)}${previewMode ? '&preview=1' : ''}#inquire`;
  const collectionLink = () => `index.html${previewMode ? '?preview=1' : ''}#collection`;
  const uniqueMedia = (items) => [...new Set(items.filter(Boolean))];

  function customerStatus(status='Available') {
    const normalized = String(status || 'Available').trim().toLowerCase();
    if (normalized === 'on etsy') return 'Available on Etsy';
    if (normalized === 'custom request') return 'Custom Request';
    if (normalized === 'in development') return 'In Development';
    if (normalized === 'coming soon') return 'Coming Soon';
    if (normalized === 'one of one') return 'One of One';
    return status || 'Available';
  }

  function availabilityForPiece(value) {
    const status = String(value?.status || '').trim().toLowerCase();
    if (status === 'on etsy') return 'Purchase through Etsy';
    if (status === 'custom request') return 'Contact Alejandra';
    if (status === 'coming soon') return 'Ask for an update';
    return 'Ask for availability';
  }

  function galleryForPiece() {
    const configured = Array.isArray(galleries[piece.id]) ? galleries[piece.id] : [];
    if (!configured.length || configured[0] !== piece.image) return [];
    return configured;
  }

  function renderGallery(visual, mainImg) {
    const media = uniqueMedia(galleryForPiece());
    if (!visual || !mainImg || media.length < 2) return;
    const mediaWrap = visual.closest('.product-media');
    if (!mediaWrap) return;
    const gallery = document.createElement('div');
    gallery.className = 'product-gallery';
    gallery.setAttribute('aria-label', `${piece.name} image gallery`);
    media.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `product-gallery-button${index === 0 ? ' active' : ''}`;
      button.setAttribute('aria-label', `View ${piece.name} image ${index + 1}`);
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.alt = `${piece.name} view ${index + 1}`;
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      thumb.addEventListener('error', () => button.remove(), {once:true});
      button.appendChild(thumb);
      button.addEventListener('click', () => {
        mainImg.src = src;
        mainImg.alt = `${piece.name} view ${index + 1}`;
        gallery.querySelectorAll('.product-gallery-button').forEach((el) => el.classList.toggle('active', el === button));
      });
      gallery.appendChild(button);
    });
    mediaWrap.appendChild(gallery);
  }

  function render() {
    const main = document.getElementById('genericProduct');
    if (!piece || piece.visibility === 'hidden') {
      if (main) main.innerHTML = `<div class="product-copy"><p class="eyebrow">OLD SOUL GEM</p><h1>Piece unavailable</h1><p>This piece is not currently shown in the Old Soul Gem collection.</p><div class="actions"><a class="btn light" href="${collectionLink()}">Back to the Collection</a><a class="btn dark" href="${ETSY_SHOP}" target="_blank" rel="noopener noreferrer">Open Etsy Shop</a></div></div>`;
      document.title = 'Piece unavailable | Old Soul Gem'; return;
    }
    if (main) main.dataset.pieceId = piece.id;
    const displayStatus = customerStatus(piece.status);
    set('genericEyebrow', `${piece.id} • ${displayStatus.toUpperCase()}`);
    set('genericName', piece.name);
    set('genericPrice', piece.price || 'See Etsy');
    set('genericStory', piece.story || '');
    set('genericMaterials', piece.materials || 'Crystal jewelry and art');
    set('genericStatus', displayStatus);
    set('genericAvailability', availabilityForPiece(piece));
    set('genericReference', piece.id);
    set('genericDesignStory', piece.story || 'This piece is part of the evolving Old Soul Gem collection.');
    set('genericVisualName', piece.name);
    const visual = document.getElementById('genericVisual');
    if (visual && piece.image) {
      visual.classList.remove('vida-placeholder');
      const img = document.createElement('img');
      img.src = piece.image;
      img.alt = piece.name;
      img.decoding = 'async';
      img.loading = 'eager';
      img.fetchPriority = 'high';
      visual.replaceChildren(img);
      img.addEventListener('error', () => {
        visual.classList.add('vida-placeholder');
        visual.innerHTML = `<div class="placeholder-copy"><span>OLD SOUL GEM</span><strong>${piece.name.replace(/[<>]/g,'')}</strong><small>View current details on Etsy</small></div>`;
      }, {once:true});
      renderGallery(visual, img);
    }

    const inquiry = document.getElementById('productInquiry');
    const inquiryTop = document.getElementById('productInquiryTop');
    const personalized = document.getElementById('productPersonalized');
    const shop = document.getElementById('productShop');
    const back = document.getElementById('productBack');
    const pieceHref = inquiryLink(piece.name);
    if (inquiry) { inquiry.href = pieceHref; inquiry.textContent = 'Ask Alejandra a Question'; }
    if (inquiryTop) inquiryTop.href = pieceHref;
    if (personalized) { personalized.href = inquiryLink('A custom jewelry request'); personalized.textContent = 'Request Something Custom'; }
    if (shop) {
      shop.href = piece.shopUrl || ETSY_SHOP;
      shop.textContent = piece.status === 'Custom Request' ? 'Connect Through Linktree' : 'View & Buy on Etsy';
    }
    if (back) back.href = collectionLink();

    document.title = `${piece.name} | Old Soul Gem`;
    const description = `${piece.name} — ${piece.story || 'a crystal jewelry or art piece from Old Soul Gem.'}`;
    const desc = document.querySelector('meta[name="description"]'); if (desc) desc.setAttribute('content', description);
    const canonical = document.getElementById('productCanonical'); if (canonical) canonical.href = `${location.origin}${location.pathname}?id=${encodeURIComponent(piece.id)}`;
    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.content = `${piece.name} | Old Soul Gem`;
    const ogDescription = document.querySelector('meta[property="og:description"]'); if (ogDescription) ogDescription.content = description;
  }
  document.addEventListener('DOMContentLoaded', render);
})();