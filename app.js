const COLLECTION_DEFAULTS = Array.isArray(window.VIDA_COLLECTION_DEFAULTS) ? window.VIDA_COLLECTION_DEFAULTS : [];
const SITE_DEFAULTS = window.VIDA_SITE_DEFAULTS || {};
const PREVIEW_KEY = 'vida_creator_preview_v2';
const INQUIRY_KEY = 'vida_inquiries';
const SPECIAL_INTERESTS = ['A personalized Vida Talisman', 'A one-of-one custom piece', 'Private appointment'];
const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const esc = (v='') => String(v).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const query = new URLSearchParams(location.search);
const previewMode = query.has('preview');
const preview = () => previewMode ? readJson(PREVIEW_KEY) : null;
const activePieces = () => Array.isArray(preview()?.pieces) ? preview().pieces : COLLECTION_DEFAULTS;
const activeSite = () => ({...SITE_DEFAULTS, ...(preview()?.site || {})});
const visiblePieces = () => activePieces().filter((p) => p.visibility !== 'hidden');
const pieceNumber = (id='') => (String(id).match(/\d+/)?.[0] || '').padStart(3,'0');
const productUrl = (piece) => `product.html?id=${encodeURIComponent(piece.id)}${previewMode ? '&preview=1' : ''}`;
const HERO_FALLBACKS = {
  'VIDA 001': 'assets/floral-opal-ring.svg',
  'VIDA 003': 'assets/floral-opal-ring.svg',
  'VIDA 004': 'assets/orbit-opal-ring.svg',
  'VIDA 005': 'assets/braided-gold-band.svg'
};

function customerStatus(status='Private') {
  const normalized = String(status || 'Private').trim().toLowerCase();
  if (normalized === 'designer review') return 'Private Preview';
  if (normalized === 'in development') return 'In Development';
  if (normalized === 'coming soon') return 'Coming Soon';
  if (normalized === 'one of one') return 'One of One';
  return status || 'Private';
}

function placeholderMarkup(piece) {
  return `<span class="visual-number">${esc(pieceNumber(piece.id))}</span><div class="placeholder-copy"><span>VIDA DESIGN STUDY</span><strong>${esc(piece.name)}</strong><small>Imagery in development</small></div>`;
}
function visualMarkup(piece) {
  if (piece.image) return `<a class="piece-visual" href="${productUrl(piece)}" data-piece-id="${esc(piece.id)}"><span class="visual-number">${esc(pieceNumber(piece.id))}</span><img loading="lazy" src="${esc(piece.image)}" alt="${esc(piece.name)}"></a>`;
  if (piece.id === 'VIDA 002') return `<a class="piece-visual visual-bolt" href="${productUrl(piece)}"><span class="visual-number">002</span><div class="star-outline">☆</div><div class="bolt-outline">ϟ</div></a>`;
  return `<a class="piece-visual vida-placeholder" href="${productUrl(piece)}">${placeholderMarkup(piece)}</a>`;
}
function renderHeroVisual() {
  const hero = document.querySelector('.hero-art'); if (!hero) return;
  const pieces = visiblePieces();
  const featured = pieces.find((p) => p.id === 'VIDA 004' && p.image) || pieces.find((p) => p.image);
  if (!featured) { hero.setAttribute('aria-label','Vida Collection design'); return; }
  const img = hero.querySelector('img');
  const caption = hero.querySelector('.art-caption strong');
  if (img) {
    img.src = featured.image;
    img.alt = `${featured.name} by Vida Collection by Alé`;
    img.onerror = () => {
      const fallback = HERO_FALLBACKS[featured.id];
      if (fallback && img.getAttribute('src') !== fallback) {
        img.src = fallback;
        return;
      }
      img.onerror = null;
      img.remove();
      hero.classList.add('vida-placeholder');
    };
  }
  if (caption) caption.textContent = featured.name;
  hero.setAttribute('aria-label', `${featured.name} by Vida Collection by Alé`);
}
function renderCollection() {
  const grid = document.querySelector('.collection-grid'); if (!grid) return;
  const pieces = visiblePieces();
  grid.innerHTML = pieces.map((p,index) => `<article class="piece ${index === 0 ? 'piece-hero' : ''}" data-piece-id="${esc(p.id)}">${visualMarkup(p)}<div class="piece-copy"><div class="piece-top"><p class="eyebrow">${esc(p.id)} • ${esc(customerStatus(p.status).toUpperCase())}</p><span class="price-tag">${esc(p.price || 'Private')}</span></div><h3>${esc(p.name)}</h3><p class="meta">${esc(p.materials || 'Fine jewelry')}</p><p class="piece-story">${esc(p.story || '')}</p><a class="piece-link" href="${productUrl(p)}">Discover the piece →</a></div></article>`).join('');
  grid.querySelectorAll('.piece-visual img').forEach((img) => img.addEventListener('error', () => { const piece = pieces.find((p) => p.id === img.closest('[data-piece-id]')?.dataset.pieceId); const visual = img.closest('.piece-visual'); if (piece && visual) { visual.classList.add('vida-placeholder'); visual.innerHTML = placeholderMarkup(piece); } }, {once:true}));
}
function setText(selector, value) { const el = document.querySelector(selector); if (el && value != null) el.textContent = value; }
function renderSite() {
  const s = activeSite();
  setText('.hero-copy .eyebrow', s.eyebrow); setText('.hero-copy h1', s.heroTitle); setText('.hero-lede', s.heroLede);
  setText('.hero-copy .actions .btn', s.primaryCta); setText('.hero-copy .actions .text-link', s.secondaryCta);
  setText('.manifesto-line', s.atelierTitle); setText('.manifesto-body', s.atelierBody);
  setText('.collection-section .section-head h2', s.collectionTitle); setText('.collection-section .section-head > p', s.collectionBody);
  setText('.story-title h2', s.storyTitle); setText('.story-copy .lead', s.storyLead); setText('.story-copy .story-body', s.storyBody);
  setText('.inquire-intro h2', s.inquiryTitle); setText('.inquire-intro .inquiry-body', s.inquiryBody); setText('.availability span:last-child', s.availability);
}
function renderInterestOptions() {
  const select = document.getElementById('interestSelect'); if (!select) return;
  const productOptions = visiblePieces().map((p) => p.name);
  const options = [...new Set(productOptions.concat(SPECIAL_INTERESTS))];
  const requested = query.get('interest');
  select.required = true;
  select.innerHTML = `<option value="" disabled ${requested && options.includes(requested) ? '' : 'selected'}>Choose a piece or service</option>` + options.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  if (requested && options.includes(requested)) select.value = requested;
}
function bindInquiryForm() {
  const form = document.getElementById('inquiryForm'); const note = document.getElementById('formNote'); if (!form || !previewMode || !preview()) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const saved = readJson(INQUIRY_KEY) || [];
    saved.unshift({...data, createdAt:new Date().toISOString(), status:'Preview'});
    localStorage.setItem(INQUIRY_KEY, JSON.stringify(saved));
    form.reset();
    renderInterestOptions();
    if (note) note.textContent = 'Preview inquiry saved locally. Live storefront submissions are emailed directly to Alé.';
  });
}
function renderPreviewBar() {
  const p = preview(); if (!previewMode || !p) return;
  const existing = document.querySelector('.creator-preview-bar'); if (existing) existing.remove();
  const bar = document.createElement('div'); bar.className = 'creator-preview-bar unified-preview';
  bar.innerHTML = `<span><strong>Creator Preview</strong> • ${p.publishedAt ? new Date(p.publishedAt).toLocaleString() : 'active'}</span><div class="creator-preview-actions"><a href="creator.html">Creator Studio</a><a href="index.html">Open live storefront</a><button type="button">Clear preview</button></div>`;
  bar.querySelector('button').onclick = () => { localStorage.removeItem(PREVIEW_KEY); location.href = 'index.html'; };
  document.body.prepend(bar); document.body.classList.add('has-creator-preview');
}
function init() { renderSite(); renderHeroVisual(); renderCollection(); renderInterestOptions(); bindInquiryForm(); renderPreviewBar(); }
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('storage', (e) => { if (previewMode && e.key === PREVIEW_KEY) location.reload(); });