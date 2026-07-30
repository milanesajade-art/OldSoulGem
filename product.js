(() => {
  const PREVIEW_KEY = 'vida_creator_preview_v2';
  const defaults = Array.isArray(window.VIDA_COLLECTION_DEFAULTS) ? window.VIDA_COLLECTION_DEFAULTS : [];
  const baselineMode = new URLSearchParams(location.search).get('baseline') === '1';
  const read = () => { if (baselineMode) return null; try { return JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch { return null; } };
  const pieces = () => Array.isArray(read()?.pieces) ? read().pieces : defaults;
  const id = new URLSearchParams(location.search).get('id');
  const piece = pieces().find((p) => p.id === id);
  const set = (id, value) => { const el = document.getElementById(id); if (el && value != null) el.textContent = value; };
  const inquiryLink = (name) => `index.html?interest=${encodeURIComponent(name)}#inquire`;
  function render() {
    const main = document.getElementById('genericProduct');
    if (!piece || piece.visibility === 'hidden') {
      if (main) main.innerHTML = '<div class="product-copy"><p class="eyebrow">VIDA</p><h1>Piece unavailable</h1><p>This piece is not currently shown in the Vida collection.</p><div class="actions"><a class="btn light" href="index.html#collection">Back to Collection</a></div></div>';
      document.title = 'Piece unavailable | Vida Collection by Alé'; return;
    }
    set('genericEyebrow', `${piece.id} • ${String(piece.status || 'Private').toUpperCase()}`); set('genericName', piece.name); set('genericPrice', piece.price || 'Private'); set('genericStory', piece.story || ''); set('genericMaterials', piece.materials || 'Fine jewelry'); set('genericStatus', piece.status || 'Private'); set('genericAvailability', piece.price || 'Private inquiry'); set('genericReference', piece.id); set('genericDesignStory', piece.story || 'This piece is part of the evolving Vida collection.'); set('genericVisualName', piece.name);
    const visual = document.getElementById('genericVisual');
    if (visual && piece.image) {
      visual.classList.remove('vida-placeholder'); const img = document.createElement('img'); img.src = piece.image; img.alt = piece.name; img.decoding = 'async'; img.loading = 'eager'; img.fetchPriority = 'high'; visual.replaceChildren(img);
      img.addEventListener('error', () => { visual.classList.add('vida-placeholder'); visual.innerHTML = `<div class="placeholder-copy"><span>VIDA DESIGN STUDY</span><strong>${piece.name.replace(/[<>]/g,'')}</strong><small>Imagery in development</small></div>`; }, {once:true});
    }
    const href = inquiryLink(piece.name); const inquiry = document.getElementById('productInquiry'); const inquiryTop = document.getElementById('productInquiryTop'); if (inquiry) inquiry.href = href; if (inquiryTop) inquiryTop.href = href;
    document.title = `${piece.name} | Vida Collection by Alé`; const description = `${piece.name} — ${piece.story || 'a private fine jewelry piece from Vida Collection by Alé.'}`; const desc = document.querySelector('meta[name="description"]'); if (desc) desc.setAttribute('content', description);
    const canonical = document.getElementById('productCanonical'); if (canonical) canonical.href = `${location.origin}${location.pathname}?id=${encodeURIComponent(piece.id)}`;
    const ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.content = `${piece.name} | Vida Collection by Alé`;
    const ogDescription = document.querySelector('meta[property="og:description"]'); if (ogDescription) ogDescription.content = description;
    if (piece.image) { let ogImage = document.querySelector('meta[property="og:image"]'); if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property','og:image'); document.head.appendChild(ogImage); } ogImage.content = piece.image; }
  }
  document.addEventListener('DOMContentLoaded', render);
})();
