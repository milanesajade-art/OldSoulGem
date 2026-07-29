const COLLECTION_DEFAULTS = Array.isArray(window.VIDA_COLLECTION_DEFAULTS) ? window.VIDA_COLLECTION_DEFAULTS : [];
const SITE_DEFAULTS = window.VIDA_SITE_DEFAULTS || {};
const WORKSPACE_KEY = 'vida_creator_workspace_v2';
const PREVIEW_KEY = 'vida_creator_preview_v2';
const INQUIRY_KEY = 'vida_inquiries';
const MEDIA_ASSETS = ['', 'assets/floral-opal-ring.svg', 'assets/orbit-opal-ring.svg', 'assets/braided-gold-band.svg'];
const SITE_FIELDS = ['eyebrow','heroTitle','heroLede','primaryCta','secondaryCta','atelierTitle','atelierBody','collectionTitle','collectionBody','storyTitle','storyLead','storyBody','inquiryTitle','inquiryBody','availability'];
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clone = (v) => JSON.parse(JSON.stringify(v));
const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const esc = (v='') => String(v).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function normalizeImageUrl(value='') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('assets/')) return raw;
  if (!/^https:\/\//i.test(raw)) return '';
  if (!raw.includes('drive.google.com')) return raw;
  const match = raw.match(/\/file\/d\/([^/]+)/) || raw.match(/[?&]id=([^&]+)/) || raw.match(/\/d\/([^/]+)/);
  return match?.[1] ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w1600` : raw;
}

function normalizePiece(piece, index=0) {
  return {
    id: piece?.id || `VIDA ${String(index + 1).padStart(3,'0')}`,
    name: piece?.name || 'Untitled Piece',
    status: piece?.status || 'Designer Review',
    visibility: piece?.visibility === 'hidden' ? 'hidden' : 'public',
    price: piece?.price || 'Private',
    materials: piece?.materials || '14K yellow gold',
    story: piece?.story || '',
    image: normalizeImageUrl(piece?.image || '')
  };
}

function defaultWorkspace() {
  return { pieces: COLLECTION_DEFAULTS.map(normalizePiece), site: clone(SITE_DEFAULTS) };
}

let workspace = readJson(WORKSPACE_KEY) || defaultWorkspace();
workspace.pieces = Array.isArray(workspace.pieces) ? workspace.pieces.map(normalizePiece) : defaultWorkspace().pieces;
workspace.site = {...clone(SITE_DEFAULTS), ...(workspace.site || {})};
let active = workspace.pieces[0]?.id || null;

function saveWorkspace() { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); }
function flash(selector, message) {
  const el = $(selector); if (!el) return;
  el.textContent = message;
  setTimeout(() => { if (el.textContent === message) el.textContent = ''; }, 4500);
}
function nextId() {
  const max = Math.max(0, ...workspace.pieces.map((p) => parseInt(String(p.id).replace(/\D/g,''),10) || 0));
  return `VIDA ${String(max + 1).padStart(3,'0')}`;
}
function activePiece() { return workspace.pieces.find((p) => p.id === active) || workspace.pieces[0] || null; }

function renderStats() {
  $('#statPieces').textContent = workspace.pieces.length;
  $('#statPublic').textContent = workspace.pieces.filter((p) => p.visibility === 'public').length;
  $('#statHidden').textContent = workspace.pieces.filter((p) => p.visibility === 'hidden').length;
  $('#statInquiries').textContent = (readJson(INQUIRY_KEY) || []).length;
}

function renderList() {
  const list = $('#creatorPieceList');
  list.innerHTML = workspace.pieces.map((p) => `<article class="creator-piece ${p.id === active ? 'selected' : ''}" data-id="${esc(p.id)}"><div class="creator-thumb">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : '<div class="creator-no-image">NO IMAGE</div>'}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.id)} • ${esc(p.price)}</p><p>${esc(p.materials)}</p></div><span class="creator-status">${esc(p.visibility === 'hidden' ? 'Hidden' : p.status)}</span></article>`).join('');
  $$('.creator-piece').forEach((el) => el.onclick = () => { active = el.dataset.id; renderList(); renderEditor(); });
  $$('.creator-thumb img').forEach((img) => img.addEventListener('error', () => { img.replaceWith(Object.assign(document.createElement('div'), {className:'creator-no-image', textContent:'IMAGE ERROR'})); }, {once:true}));
}

function populateImageSelect(value='') {
  const select = $('#pieceImage');
  const libraryValue = MEDIA_ASSETS.includes(value) ? value : '';
  select.innerHTML = MEDIA_ASSETS.map((a) => `<option value="${esc(a)}" ${a === libraryValue ? 'selected' : ''}>${a || 'No library image'}</option>`).join('');
}

function validatePiece(p) {
  const issues = [];
  if (!p.name.trim()) issues.push('Name is required.');
  if (!p.materials.trim()) issues.push('Materials are required.');
  if (!p.story.trim()) issues.push('Story is required.');
  if (!p.price.trim()) issues.push('Price or availability is required.');
  if (p.visibility === 'public' && !p.image && !['VIDA 001','VIDA 002'].includes(p.id)) issues.push('Public piece has no image; storefront will use a branded placeholder.');
  return issues;
}

function renderValidation(p) {
  const issues = validatePiece(p);
  $('#validationBox').innerHTML = issues.length ? `<strong>Review</strong><ul>${issues.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '<strong class="ok">Ready to preview.</strong>';
}

function renderEditor() {
  const p = activePiece(); if (!p) return;
  $('#pieceId').value = p.id;
  $('#pieceName').value = p.name;
  $('#pieceStatus').value = p.status;
  $('#pieceVisibility').value = p.visibility;
  $('#piecePrice').value = p.price;
  $('#pieceMaterials').value = p.materials;
  populateImageSelect(p.image);
  $('#pieceImageUrl').value = p.image && !MEDIA_ASSETS.includes(p.image) ? p.image : '';
  $('#pieceStory').value = p.story;
  $('#editorTitle').textContent = p.name;
  $('#editorMeta').textContent = `${p.id} • ${p.visibility === 'hidden' ? 'Hidden' : p.status}`;
  renderValidation(p);
}

function syncPieceForm() {
  const p = activePiece(); if (!p) return null;
  p.name = $('#pieceName').value.trim();
  p.status = $('#pieceStatus').value;
  p.visibility = $('#pieceVisibility').value;
  p.price = $('#piecePrice').value.trim();
  p.materials = $('#pieceMaterials').value.trim();
  const external = normalizeImageUrl($('#pieceImageUrl').value);
  p.image = external || $('#pieceImage').value;
  if (external) $('#pieceImageUrl').value = external;
  p.story = $('#pieceStory').value.trim();
  return p;
}

function renderSiteEditor() {
  SITE_FIELDS.forEach((key) => { const input = $(`[data-site-key="${key}"]`); if (input) input.value = workspace.site[key] || ''; });
}
function syncSiteForm() {
  SITE_FIELDS.forEach((key) => { const input = $(`[data-site-key="${key}"]`); if (input) workspace.site[key] = input.value.trim(); });
}

function renderMedia() {
  const used = new Set(workspace.pieces.map((p) => p.image).filter(Boolean));
  $('#mediaGrid').innerHTML = MEDIA_ASSETS.filter(Boolean).map((src) => `<article class="creator-media-card"><img src="${esc(src)}" alt="Vida media asset"><div class="creator-media-copy"><strong>${esc(src.split('/').pop())}</strong><span>${used.has(src) ? 'Assigned to collection' : 'Available'}</span><button class="creator-btn media-assign" data-src="${esc(src)}" type="button">Assign to selected piece</button></div></article>`).join('');
  $$('.media-assign').forEach((btn) => btn.onclick = () => { const p = activePiece(); if (!p) return; p.image = btn.dataset.src; saveWorkspace(); renderAll(); flash('#saveNote','Image assigned.'); });
}

function renderInquiries() {
  const inquiries = readJson(INQUIRY_KEY) || [];
  $('#inquiryRows').innerHTML = inquiries.length ? inquiries.map((i, idx) => `<tr><td>${esc(i.name || '—')}</td><td>${esc(i.interest || '—')}</td><td>${esc(i.email || '—')}</td><td><select class="inquiry-status" data-index="${idx}"><option ${i.status === 'New' ? 'selected' : ''}>New</option><option ${i.status === 'Contacted' ? 'selected' : ''}>Contacted</option><option ${i.status === 'Appointment' ? 'selected' : ''}>Appointment</option><option ${i.status === 'Closed' ? 'selected' : ''}>Closed</option></select></td><td>${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '—'}</td></tr>`).join('') : '<tr><td colspan="5" class="creator-muted">No saved preview inquiries yet.</td></tr>';
  $$('.inquiry-status').forEach((select) => select.onchange = () => { const data = readJson(INQUIRY_KEY) || []; if (data[select.dataset.index]) data[select.dataset.index].status = select.value; localStorage.setItem(INQUIRY_KEY, JSON.stringify(data)); });
}

function writePreview() {
  syncPieceForm(); syncSiteForm(); saveWorkspace();
  const payload = { version: 2, publishedAt: new Date().toISOString(), pieces: clone(workspace.pieces), site: clone(workspace.site) };
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  return payload;
}
function previewStorefront() { const payload = writePreview(); flash('#previewNote','Preview updated. Opening storefront…'); setTimeout(() => window.open(`index.html?preview=${encodeURIComponent(payload.publishedAt)}`,'vida-storefront'), 120); }
function previewPiece() { const p = syncPieceForm(); if (!p) return; const payload = writePreview(); setTimeout(() => window.open(`product.html?id=${encodeURIComponent(p.id)}&preview=${encodeURIComponent(payload.publishedAt)}`,'vida-piece-preview'), 120); }
function clearPreview() { localStorage.removeItem(PREVIEW_KEY); renderReview(); flash('#previewNote','Creator preview cleared. Storefront now uses the repo baseline.'); }

function exportWorkspace() {
  syncPieceForm(); syncSiteForm(); saveWorkspace();
  const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(), ...workspace}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vida-creator-workspace.json'; a.click(); URL.revokeObjectURL(url);
}

function renderReview() {
  const preview = readJson(PREVIEW_KEY);
  $('#previewState').textContent = preview ? 'ACTIVE' : 'CLEAN';
  $('#previewSummary').textContent = preview ? `Preview saved ${new Date(preview.publishedAt).toLocaleString()}. It affects this browser only.` : 'No Creator preview is active. The storefront is showing the repository baseline.';
}

function addPiece() {
  const id = nextId();
  workspace.pieces.push(normalizePiece({id, name:'Untitled Piece', status:'Designer Review', visibility:'hidden', price:'Private', materials:'14K yellow gold', story:'', image:''}, workspace.pieces.length));
  active = id; saveWorkspace(); renderAll(); flash('#saveNote',`${id} created hidden by default.`);
}
function duplicatePiece() { const source = activePiece(); if (!source) return; const copy = clone(source); copy.id = nextId(); copy.name = `${source.name} Study`; copy.visibility = 'hidden'; workspace.pieces.push(copy); active = copy.id; saveWorkspace(); renderAll(); flash('#saveNote',`${copy.id} duplicated and hidden by default.`); }
function deletePiece() { const idx = workspace.pieces.findIndex((p) => p.id === active); if (idx < 0) return; const removed = workspace.pieces.splice(idx,1)[0]; active = workspace.pieces[Math.max(0,idx-1)]?.id || workspace.pieces[0]?.id || null; saveWorkspace(); renderAll(); flash('#saveNote',`${removed.id} removed from this workspace.`); }
function resetWorkspace() { workspace = defaultWorkspace(); active = workspace.pieces[0]?.id || null; localStorage.removeItem(WORKSPACE_KEY); localStorage.removeItem(PREVIEW_KEY); renderAll(); flash('#previewNote','Creator workspace reset to the repository baseline.'); }

function activateView(view) {
  $$('.creator-nav button[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $$('.creator-view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  location.hash = view;
  if (view === 'media') renderMedia(); if (view === 'inquiries') renderInquiries(); if (view === 'review') renderReview();
}

function bind() {
  $$('.creator-nav button[data-view]').forEach((btn) => btn.onclick = () => activateView(btn.dataset.view));
  $('#pieceForm').addEventListener('submit', (e) => { e.preventDefault(); const p = syncPieceForm(); if (!p) return; saveWorkspace(); renderList(); renderStats(); renderValidation(p); flash('#saveNote','Piece draft saved.'); });
  $('#siteForm').addEventListener('submit', (e) => { e.preventDefault(); syncSiteForm(); saveWorkspace(); flash('#siteNote','Site copy saved.'); });
  ['pieceName','pieceStatus','pieceVisibility','piecePrice','pieceMaterials','pieceImage','pieceImageUrl','pieceStory'].forEach((id) => $(`#${id}`).addEventListener('input', () => { const p = syncPieceForm(); if (p) renderValidation(p); }));
  $('#addPiece').onclick = addPiece; $('#duplicatePiece').onclick = duplicatePiece; $('#deletePiece').onclick = deletePiece; $('#previewPiece').onclick = previewPiece;
  $('#previewStorefront').onclick = previewStorefront; $('#reviewPreview').onclick = previewStorefront; $('#clearPreview').onclick = clearPreview; $('#resetWorkspace').onclick = resetWorkspace; $('#exportWorkspace').onclick = exportWorkspace;
  $('#clearInquiries').onclick = () => { localStorage.removeItem(INQUIRY_KEY); renderInquiries(); renderStats(); };
}

function renderAll() { renderStats(); renderList(); renderEditor(); renderSiteEditor(); renderMedia(); renderInquiries(); renderReview(); }

document.addEventListener('DOMContentLoaded', () => {
  renderAll(); bind();
  const requested = location.hash.replace('#','');
  activateView(['collection','site','media','inquiries','review'].includes(requested) ? requested : 'collection');
});
