const COLLECTION_DEFAULTS = Array.isArray(window.VIDA_COLLECTION_DEFAULTS) ? window.VIDA_COLLECTION_DEFAULTS : [];
const SITE_DEFAULTS = window.VIDA_SITE_DEFAULTS || {};
const WORKSPACE_KEY = 'vida_creator_workspace_v2';
const PREVIEW_KEY = 'vida_creator_preview_v2';
const INQUIRY_KEY = 'vida_inquiries';

const OLD_DRIVE_LUZ = 'https://drive.google.com/thumbnail?id=1z67xn9XOQAmZS5Xes2UMvL4DEO6B4nu1&sz=w1600';
const OLD_DRIVE_ORBITA = 'https://drive.google.com/thumbnail?id=13Ok8L8ltwjeKmSn-13kTAD8LBiUXhkwL&sz=w1600';
const OLD_DRIVE_ENTRELAZADO = 'https://drive.google.com/thumbnail?id=1YWv3S2YuAzaJjHh1US---8qR_WTGN8Eq&sz=w1600';
const CLEAN_FLOR = 'https://drive.google.com/thumbnail?id=1STYhz_iuJAu4Yjxh0-z_c2SWWrG1y-_t&sz=w1600';
const CLEAN_LUZ = 'https://drive.google.com/thumbnail?id=1RHhwrEkBw-TBh-aBR0pOJJdx49PDeWJb&sz=w1600';
const CLEAN_ORBITA = 'https://drive.google.com/thumbnail?id=1-5tVLig0R4tZ_8RcpMcTnMIWPb7avkWj&sz=w1600';
const CLEAN_ORBITA_ANGLE = 'https://drive.google.com/thumbnail?id=1jRRwLeBcJCNWOBbybR-oz0tPB8JSX6Wo&sz=w1600';
const CLEAN_ORBITA_PROFILE = 'https://drive.google.com/thumbnail?id=1ym5L548RdXNaUoGPskpuIWh31zRJKsqn&sz=w1600';
const CLEAN_ENTRELAZADO = 'https://drive.google.com/thumbnail?id=1FA4GqgSnIixn2i2gXGOV8CrwGIO4FzkK&sz=w1600';
const CLEAN_ENTRELAZADO_HAND = 'https://drive.google.com/thumbnail?id=1RSch8nHdrAr7a1K8onAa5EcMmLbcGVQD&sz=w1600';
const LUZ_FALLBACK = 'assets/floral-opal-ring.svg';

const IMAGE_MIGRATIONS = {
  [OLD_DRIVE_LUZ]: CLEAN_LUZ,
  [LUZ_FALLBACK]: CLEAN_LUZ,
  [OLD_DRIVE_ORBITA]: CLEAN_ORBITA,
  [OLD_DRIVE_ENTRELAZADO]: CLEAN_ENTRELAZADO
};
const MEDIA_ASSETS = ['', CLEAN_FLOR, CLEAN_LUZ, CLEAN_ORBITA, CLEAN_ORBITA_ANGLE, CLEAN_ORBITA_PROFILE, CLEAN_ENTRELAZADO, CLEAN_ENTRELAZADO_HAND, LUZ_FALLBACK, 'assets/orbit-opal-ring.svg', 'assets/braided-gold-band.svg'];
const MEDIA_LABELS = {
  [CLEAN_FLOR]: 'Flor de Vida • clean primary',
  [CLEAN_LUZ]: 'Luz de Alé • clean primary',
  [CLEAN_ORBITA]: 'Órbita • clean primary',
  [CLEAN_ORBITA_ANGLE]: 'Órbita • clean angle',
  [CLEAN_ORBITA_PROFILE]: 'Órbita • clean profile',
  [CLEAN_ENTRELAZADO]: 'Entrelazado • clean primary',
  [CLEAN_ENTRELAZADO_HAND]: 'Entrelazado • clean on-hand',
  [LUZ_FALLBACK]: 'Luz de Alé • fallback artwork',
  'assets/orbit-opal-ring.svg': 'Órbita • fallback artwork',
  'assets/braided-gold-band.svg': 'Entrelazado • fallback artwork'
};
const SITE_FIELDS = ['eyebrow','heroTitle','heroLede','primaryCta','secondaryCta','atelierTitle','atelierBody','collectionTitle','collectionBody','storyTitle','storyLead','storyBody','inquiryTitle','inquiryBody','availability'];
const REQUIRED_SITE_FIELDS = ['heroTitle','heroLede','collectionTitle','inquiryTitle','inquiryBody','availability'];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const esc = (value='') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function fingerprint(value) {
  const bytes = new TextEncoder().encode(stableStringify(value));
  let hash = 2166136261;
  bytes.forEach((byte) => { hash ^= byte; hash = Math.imul(hash, 16777619) >>> 0; });
  return hash.toString(16).padStart(8,'0');
}
const BASELINE_FINGERPRINT = fingerprint({pieces: COLLECTION_DEFAULTS, site: SITE_DEFAULTS});

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
  const normalizedImage = normalizeImageUrl(piece?.image || '');
  return {
    id: piece?.id || `VIDA ${String(index + 1).padStart(3,'0')}`,
    name: piece?.name || 'Untitled Piece',
    status: piece?.status || 'Designer Review',
    visibility: piece?.visibility === 'hidden' ? 'hidden' : 'public',
    price: piece?.price || 'Private',
    materials: piece?.materials || '14K yellow gold',
    story: piece?.story || '',
    image: IMAGE_MIGRATIONS[normalizedImage] || normalizedImage
  };
}
function defaultWorkspace() {
  return {baselineFingerprint: BASELINE_FINGERPRINT, pieces: COLLECTION_DEFAULTS.map(normalizePiece), site: clone(SITE_DEFAULTS)};
}

const savedWorkspace = readJson(WORKSPACE_KEY);
let workspace = savedWorkspace || defaultWorkspace();
workspace.pieces = Array.isArray(workspace.pieces) ? workspace.pieces.map(normalizePiece) : defaultWorkspace().pieces;
workspace.site = {...clone(SITE_DEFAULTS), ...(workspace.site || {})};
workspace.baselineFingerprint = workspace.baselineFingerprint || null;
let workspaceStale = Boolean(savedWorkspace && workspace.baselineFingerprint !== BASELINE_FINGERPRINT);
localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
let active = workspace.pieces[0]?.id || null;

function saveWorkspace() { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); }
function flash(selector, message) {
  const el = $(selector); if (!el) return;
  el.textContent = message;
  setTimeout(() => { if (el.textContent === message) el.textContent = ''; }, 8000);
}
function confirmAction(message) { return window.confirm(message); }
function nextId() {
  const max = Math.max(0, ...workspace.pieces.map((piece) => parseInt(String(piece.id).replace(/\D/g,''),10) || 0));
  return `VIDA ${String(max + 1).padStart(3,'0')}`;
}
function activePiece() { return workspace.pieces.find((piece) => piece.id === active) || workspace.pieces[0] || null; }

function renderStats() {
  $('#statPieces').textContent = workspace.pieces.length;
  $('#statPublic').textContent = workspace.pieces.filter((piece) => piece.visibility === 'public').length;
  $('#statHidden').textContent = workspace.pieces.filter((piece) => piece.visibility === 'hidden').length;
  $('#statInquiries').textContent = (readJson(INQUIRY_KEY) || []).length;
}
function renderList() {
  const list = $('#creatorPieceList');
  list.innerHTML = workspace.pieces.map((piece) => `<article class="creator-piece ${piece.id === active ? 'selected' : ''}" data-id="${esc(piece.id)}"><div class="creator-thumb">${piece.image ? `<img src="${esc(piece.image)}" alt="${esc(piece.name)}">` : '<div class="creator-no-image">NO IMAGE</div>'}</div><div><h3>${esc(piece.name)}</h3><p>${esc(piece.id)} • ${esc(piece.price)}</p><p>${esc(piece.materials)}</p></div><span class="creator-status">${esc(piece.visibility === 'hidden' ? 'Hidden' : piece.status)}</span></article>`).join('');
  $$('.creator-piece').forEach((el) => { el.onclick = () => { active = el.dataset.id; renderList(); renderEditor(); }; });
  $$('.creator-thumb img').forEach((img) => img.addEventListener('error', () => { img.replaceWith(Object.assign(document.createElement('div'), {className:'creator-no-image', textContent:'IMAGE ERROR'})); }, {once:true}));
}
function populateImageSelect(value='') {
  const select = $('#pieceImage');
  const libraryValue = MEDIA_ASSETS.includes(value) ? value : '';
  select.innerHTML = MEDIA_ASSETS.map((asset) => `<option value="${esc(asset)}" ${asset === libraryValue ? 'selected' : ''}>${asset ? esc(MEDIA_LABELS[asset] || asset) : 'No library image'}</option>`).join('');
}
function validatePiece(piece) {
  const errors = [];
  const warnings = [];
  if (!piece.name.trim()) errors.push('Name is required.');
  if (!piece.materials.trim()) errors.push('Materials are required.');
  if (!piece.story.trim()) errors.push('Story is required.');
  if (!piece.price.trim()) errors.push('Price or display value is required.');
  if (piece.visibility === 'public' && !piece.image && piece.id !== 'VIDA 002') errors.push('Public piece needs a production image before publishing.');
  if (piece.visibility === 'hidden' && !piece.image) warnings.push('Hidden draft has no image yet.');
  return {errors, warnings};
}
function validateSite() {
  return REQUIRED_SITE_FIELDS.filter((key) => !String(workspace.site[key] || '').trim()).map((key) => `Site field ${key} is required.`);
}
function publishErrors() {
  return [...workspace.pieces.flatMap((piece) => validatePiece(piece).errors.map((message) => `${piece.id}: ${message}`)), ...validateSite()];
}
function renderValidation(piece) {
  const {errors, warnings} = validatePiece(piece);
  const items = [...errors.map((item) => `<li><strong>BLOCKS PUBLISH:</strong> ${esc(item)}</li>`), ...warnings.map((item) => `<li>${esc(item)}</li>`)];
  $('#validationBox').innerHTML = items.length ? `<strong>Review</strong><ul>${items.join('')}</ul>` : '<strong class="ok">Ready to preview and publish.</strong>';
}
function renderEditor() {
  const piece = activePiece(); if (!piece) return;
  $('#pieceId').value = piece.id;
  $('#pieceName').value = piece.name;
  $('#pieceStatus').value = piece.status;
  $('#pieceVisibility').value = piece.visibility;
  $('#piecePrice').value = piece.price;
  $('#pieceMaterials').value = piece.materials;
  populateImageSelect(piece.image);
  $('#pieceImageUrl').value = piece.image && !MEDIA_ASSETS.includes(piece.image) ? piece.image : '';
  $('#pieceStory').value = piece.story;
  $('#editorTitle').textContent = piece.name;
  $('#editorMeta').textContent = `${piece.id} • ${piece.visibility === 'hidden' ? 'Hidden' : piece.status}`;
  renderValidation(piece);
}
function syncPieceForm() {
  const piece = activePiece(); if (!piece) return null;
  piece.name = $('#pieceName').value.trim();
  piece.status = $('#pieceStatus').value;
  piece.visibility = $('#pieceVisibility').value;
  piece.price = $('#piecePrice').value.trim();
  piece.materials = $('#pieceMaterials').value.trim();
  const external = normalizeImageUrl($('#pieceImageUrl').value);
  piece.image = external || $('#pieceImage').value;
  if (external) $('#pieceImageUrl').value = external;
  piece.story = $('#pieceStory').value.trim();
  return piece;
}
function renderSiteEditor() {
  SITE_FIELDS.forEach((key) => { const input = $(`[data-site-key="${key}"]`); if (input) input.value = workspace.site[key] || ''; });
}
function syncSiteForm() {
  SITE_FIELDS.forEach((key) => { const input = $(`[data-site-key="${key}"]`); if (input) workspace.site[key] = input.value.trim(); });
}
function renderMedia() {
  const used = new Set(workspace.pieces.map((piece) => piece.image).filter(Boolean));
  $('#mediaGrid').innerHTML = MEDIA_ASSETS.filter(Boolean).map((src) => `<article class="creator-media-card"><img src="${esc(src)}" alt="${esc(MEDIA_LABELS[src] || 'Vida media asset')}"><div class="creator-media-copy"><strong>${esc(MEDIA_LABELS[src] || src.split('/').pop())}</strong><span>${used.has(src) ? 'Assigned to collection' : 'Available'}</span><button class="creator-btn media-assign" data-src="${esc(src)}" type="button">Assign to selected piece</button></div></article>`).join('');
  $$('.media-assign').forEach((button) => { button.onclick = () => { const piece = activePiece(); if (!piece) return; piece.image = button.dataset.src; saveWorkspace(); renderAll(); flash('#saveNote','Image assigned.'); }; });
}
function renderInquiries() {
  const inquiries = readJson(INQUIRY_KEY) || [];
  $('#inquiryRows').innerHTML = inquiries.length ? inquiries.map((inquiry, index) => `<tr><td>${esc(inquiry.name || '—')}</td><td>${esc(inquiry.interest || '—')}</td><td>${esc(inquiry.email || '—')}</td><td><select class="inquiry-status" data-index="${index}"><option ${inquiry.status === 'Preview' ? 'selected' : ''}>Preview</option><option ${inquiry.status === 'Contacted' ? 'selected' : ''}>Contacted</option><option ${inquiry.status === 'Appointment' ? 'selected' : ''}>Appointment</option><option ${inquiry.status === 'Closed' ? 'selected' : ''}>Closed</option></select></td><td>${inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '—'}</td></tr>`).join('') : '<tr><td colspan="5" class="creator-muted">No saved preview inquiries yet. Live customer inquiries are emailed directly to Alé.</td></tr>';
  $$('.inquiry-status').forEach((select) => { select.onchange = () => { const data = readJson(INQUIRY_KEY) || []; if (data[select.dataset.index]) data[select.dataset.index].status = select.value; localStorage.setItem(INQUIRY_KEY, JSON.stringify(data)); }; });
}

function writePreview() {
  syncPieceForm();
  syncSiteForm();
  saveWorkspace();
  const payload = {version:2, publishedAt:new Date().toISOString(), pieces:clone(workspace.pieces), site:clone(workspace.site)};
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  return payload;
}
function previewStorefront() {
  const payload = writePreview();
  flash('#previewNote','Preview updated. Opening storefront…');
  setTimeout(() => window.open(`index.html?preview=${encodeURIComponent(payload.publishedAt)}`,'vida-storefront'), 120);
}
function previewPiece() {
  const piece = syncPieceForm(); if (!piece) return;
  const payload = writePreview();
  setTimeout(() => window.open(`product.html?id=${encodeURIComponent(piece.id)}&preview=${encodeURIComponent(payload.publishedAt)}`,'vida-piece-preview'), 120);
}
function clearPreview() {
  localStorage.removeItem(PREVIEW_KEY);
  renderReview();
  flash('#previewNote','Creator preview cleared. Normal storefront URLs always show production.');
}
function exportWorkspace() {
  syncPieceForm(); syncSiteForm(); saveWorkspace();
  const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(), ...workspace}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vida-creator-workspace.json';
  link.click();
  URL.revokeObjectURL(url);
}
function publishLive() {
  syncPieceForm(); syncSiteForm(); saveWorkspace();
  const errors = publishErrors();
  if (workspaceStale) {
    activateView('review');
    flash('#previewNote','Publish blocked: this workspace is based on an older production version. Export it if needed, then Reset Workspace to reload current production before publishing.');
    renderReview();
    return;
  }
  if (errors.length) {
    activateView('review');
    flash('#previewNote',`Publish blocked: resolve ${errors.length} required item${errors.length === 1 ? '' : 's'} first.`);
    renderReview();
    return;
  }
  const packageData = {version:4, publishedAt:new Date().toISOString(), baselineFingerprint:BASELINE_FINGERPRINT, pieces:clone(workspace.pieces), site:clone(workspace.site)};
  const body = `<!-- VIDA_CREATOR_PUBLISH_V4 -->\n${JSON.stringify(packageData)}`;
  const title = `VIDA Creator Publish ${new Date().toLocaleString()}`;
  const url = `https://github.com/milanesajade-art/thevidacollection/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  if (url.length > 12000) { flash('#previewNote','Publish package is too large for one-click publishing. Export the workspace instead.'); return; }
  flash('#previewNote','Opening secure GitHub publish approval…');
  window.open(url,'vida-production-publish','noopener');
}
function renderReview() {
  const preview = readJson(PREVIEW_KEY);
  const errors = publishErrors();
  const publishButton = $('#publishLive');
  if (publishButton) publishButton.disabled = workspaceStale || errors.length > 0;
  $('#previewState').textContent = workspaceStale ? 'STALE' : errors.length ? 'BLOCKED' : preview ? 'ACTIVE' : 'CLEAN';
  if (workspaceStale) $('#previewSummary').textContent = 'This browser workspace was created from an older production version. Preview/export is safe, but publishing is blocked until you reset to the current repository baseline.';
  else if (errors.length) $('#previewSummary').textContent = `${errors.length} required publish item${errors.length === 1 ? '' : 's'} must be resolved. ${errors.slice(0,3).join(' ')}`;
  else $('#previewSummary').textContent = preview ? `Preview saved ${new Date(preview.publishedAt).toLocaleString()}. It affects explicit Preview URLs only.` : 'No Creator preview is active. Normal storefront URLs always show repository production.';
}

function addPiece() {
  const id = nextId();
  workspace.pieces.push(normalizePiece({id, name:'Untitled Piece', status:'Designer Review', visibility:'hidden', price:'Private', materials:'14K yellow gold', story:'', image:''}, workspace.pieces.length));
  active = id;
  saveWorkspace();
  renderAll();
  flash('#saveNote',`${id} created hidden by default.`);
}
function duplicatePiece() {
  const source = activePiece(); if (!source) return;
  const copy = clone(source);
  copy.id = nextId();
  copy.name = `${source.name} Study`;
  copy.visibility = 'hidden';
  workspace.pieces.push(copy);
  active = copy.id;
  saveWorkspace();
  renderAll();
  flash('#saveNote',`${copy.id} duplicated and hidden by default.`);
}
function deletePiece() {
  const piece = activePiece(); if (!piece) return;
  if (workspace.pieces.length <= 1) { flash('#saveNote','Keep at least one piece in the Creator workspace.'); return; }
  if (!confirmAction(`Remove ${piece.id} — ${piece.name} from this Creator workspace? This does not affect the live site unless you later publish.`)) return;
  const index = workspace.pieces.findIndex((item) => item.id === active);
  if (index < 0) return;
  const removed = workspace.pieces.splice(index,1)[0];
  active = workspace.pieces[Math.max(0,index-1)]?.id || workspace.pieces[0]?.id || null;
  saveWorkspace();
  renderAll();
  flash('#saveNote',`${removed.id} removed from this workspace.`);
}
function resetWorkspace() {
  if (!confirmAction('Reset Creator to the current live repository baseline? Unsaved local Creator changes and the current preview will be discarded.')) return;
  workspace = defaultWorkspace();
  workspaceStale = false;
  active = workspace.pieces[0]?.id || null;
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  localStorage.removeItem(PREVIEW_KEY);
  renderAll();
  flash('#previewNote','Creator workspace reset to the current repository baseline.');
}
function clearPreviewInquiries() {
  const inquiries = readJson(INQUIRY_KEY) || [];
  if (!inquiries.length) { flash('#previewNote','There are no preview inquiries to clear.'); return; }
  if (!confirmAction(`Clear ${inquiries.length} preview inquir${inquiries.length === 1 ? 'y' : 'ies'} from this browser? Live emailed inquiries are not affected.`)) return;
  localStorage.removeItem(INQUIRY_KEY);
  renderInquiries();
  renderStats();
}
function activateView(view) {
  $$('.creator-nav button[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  $$('.creator-view').forEach((panel) => panel.classList.toggle('active', panel.id === `view-${view}`));
  location.hash = view;
  if (view === 'media') renderMedia();
  if (view === 'inquiries') renderInquiries();
  if (view === 'review') renderReview();
}
function bind() {
  $$('.creator-nav button[data-view]').forEach((button) => { button.onclick = () => activateView(button.dataset.view); });
  $('#pieceForm').addEventListener('submit', (event) => { event.preventDefault(); const piece = syncPieceForm(); if (!piece) return; saveWorkspace(); renderList(); renderStats(); renderValidation(piece); renderReview(); flash('#saveNote','Piece draft saved.'); });
  $('#siteForm').addEventListener('submit', (event) => { event.preventDefault(); syncSiteForm(); saveWorkspace(); renderReview(); flash('#siteNote','Site copy saved.'); });
  ['pieceName','pieceStatus','pieceVisibility','piecePrice','pieceMaterials','pieceStory'].forEach((id) => $(`#${id}`).addEventListener('input', () => { const piece = syncPieceForm(); if (piece) { renderValidation(piece); renderReview(); } }));
  $('#pieceImage').addEventListener('change', () => { if ($('#pieceImage').value) $('#pieceImageUrl').value = ''; const piece = syncPieceForm(); if (piece) { renderValidation(piece); renderReview(); } });
  $('#pieceImageUrl').addEventListener('input', () => { if ($('#pieceImageUrl').value.trim()) $('#pieceImage').value = ''; const piece = syncPieceForm(); if (piece) { renderValidation(piece); renderReview(); } });
  $('#addPiece').onclick = addPiece;
  $('#duplicatePiece').onclick = duplicatePiece;
  $('#deletePiece').onclick = deletePiece;
  $('#previewPiece').onclick = previewPiece;
  $('#previewStorefront').onclick = previewStorefront;
  $('#reviewPreview').onclick = previewStorefront;
  $('#publishLive').onclick = publishLive;
  $('#clearPreview').onclick = clearPreview;
  $('#resetWorkspace').onclick = resetWorkspace;
  $('#exportWorkspace').onclick = exportWorkspace;
  $('#clearInquiries').onclick = clearPreviewInquiries;
}
function renderAll() {
  renderStats();
  renderList();
  renderEditor();
  renderSiteEditor();
  renderMedia();
  renderInquiries();
  renderReview();
}
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  bind();
  const requested = location.hash.replace('#','');
  activateView(['collection','site','media','inquiries','review'].includes(requested) ? requested : 'collection');
});