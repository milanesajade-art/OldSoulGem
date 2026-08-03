(() => {
  const PREVIEW_KEY = 'vida_creator_preview_v2';
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

  function customerStatus(status='Private') {
    const normalized = String(status || 'Private').trim().toLowerCase();
    if (normalized === 'designer review') return 'Private Preview';
    if (normalized === 'in development') return 'In Development';
    if (normalized === 'coming soon') return 'Coming Soon';
    if (normalized === 'one of one') return 'One of One';
    return status || 'Private';
  }

  function availabilityForPiece(value) {
    const status = String(value?.status || '').trim().toLowerCase();
    if (status === 'coming soon') return 'Advance inquiry';
    if (status === 'in development') return 'Available by commission';
    if (status === 'designer review') return 'Private preview';
    if (status === 'one of one') return 'Private inquiry';
    return 'Private inquiry';
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
      if (main) main.innerHTML = `<div class="product-copy"><p class="eyebrow">VIDA</p><h1>Piece unavailable</h1><p>This piece is not currently shown in the Vida collection.</p><div class="actions"><a class="btn light" href="${collectionLink()}">Back to Collection</a></div></div>`;
      document.title = 'Piece unavailable | Vida Collection by Alé'; return;
    }
    if (main) main.dataset.pieceId = piece.id;
    const displayStatus = customerStatus(piece.status);
    set('genericEyebrow', `${piece.id} • ${displayStatus.toUpperCase()}`); set('genericName', piece.name); set('genericPrice', piece.price || 'Private'); set('genericStory', piece.story || ''); set('genericMaterials', piece.materials || 'Fine jewelry'); set('genericStatus', displayStatus); set('genericAvailability', availabilityForPiece(piece)); set('genericReference', piece.id); set('genericDesignStory', piece.story || 'This piece is part of the evolving Vida collection.'); set('genericVisualName', piece.name);
    const visual = document.getElementById('genericVisual');
    if (visual && piece.image) {
      visual.classList.remove('vida-placeholder'); const img = document.createElement('img'); img.src = piece.image; img.alt = piece.name; img.decoding = 'async'; img.loading = 'eager'; img.fetchPriority = 'high'; visual.replaceChildren(img);
      img.addEventListener('error', () => { visual.classList.add('vida-placeholder'); visual.innerHTML = `<div class="placeholder-copy"><span>VIDA DESIGN STUDY</span><strong>${piece.name.replace(/[<>]/g,'')}</strong><small>Imagery in development</small></div>`; }, {once:true});
      renderGallery(visual, img);
    }

    const isTalisman = piece.id === 'VIDA 009' || /talisman/i.test(piece.name);
    const inquiry = document.getElementById('productInquiry');
    const inquiryTop = document.getElementById('productInquiryTop');
    const personalized = document.getElementById('productPersonalized');
    const commission = document.getElementById('productCommission');
    const back = document.getElementById('productBack');
    const pieceHref = inquiryLink(piece.name);
    if (inquiry) { inquiry.href = pieceHref; inquiry.textContent = isTalisman ? 'Inquire About This Talisman' : 'Inquire About This Piece'; }
    if (inquiryTop) inquiryTop.href = pieceHref;
    if (personalized) { personalized.href = inquiryLink('A personalized Vida Talisman'); personalized.textContent = isTalisman ? 'Personalize This Talisman' : 'Request a Personalized Version'; }
    if (commission) commission.href = inquiryLink('A one-of-one custom piece');
    if (back) back.href = collectionLink();

    document.title = `${piece.name} | Vida Collection by Alé`; const description = `${piece.name} — ${piece.story || 'a private fine jewelry piece from Vida Collection by Alé.'}`; const desc = document.querySelector('meta[name="description"]'); if (desc) desc.setAttribute('content', description);
    const canonical = document.getElementById('productCanonical'); if (canonical) canonical.href = `${location.origin}${location.pathname}?id=${encodeURIComponent(piece.id)}`;
    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.content = `${piece.name} | Vida Collection by Alé`;
    const ogDescription = document.querySelector('meta[property="og:description"]'); if (ogDescription) ogDescription.content = description;
    if (piece.image) { let ogImage = document.querySelector('meta[property="og:image"]'); if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property','og:image'); document.head.appendChild(ogImage); } ogImage.content = piece.image; }
  }
  document.addEventListener('DOMContentLoaded', render);
})();