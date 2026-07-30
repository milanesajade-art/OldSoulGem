(() => {
  const root = document.documentElement;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  root.classList.toggle('is-standalone', standalone);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', {scope:'./'}).catch(() => {}), {once:true});
  }

  function addDock() {
    if (!standalone || document.querySelector('.pwa-dock') || document.body.classList.contains('creator-body')) return;
    const inquiryHref = document.getElementById('productInquiry')?.getAttribute('href') || 'index.html#inquire';
    const dock = document.createElement('nav');
    dock.className = 'pwa-dock';
    dock.setAttribute('aria-label', 'Vida app navigation');
    dock.innerHTML = '<a href="index.html">Home</a><a href="index.html#collection">Collection</a><a href="' + inquiryHref.replace(/"/g,'&quot;') + '">Private Inquiry</a>';
    document.body.appendChild(dock);
  }

  let deferredPrompt = null;
  function installButton() {
    let button = document.querySelector('.pwa-install');
    if (!button) {
      const footer = document.querySelector('footer .footer-copy') || document.querySelector('footer');
      if (!footer) return null;
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'pwa-install';
      button.textContent = 'Install Vida App';
      footer.appendChild(button);
    }
    return button;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    const button = installButton();
    if (!button) return;
    button.classList.add('is-visible');
    button.onclick = async () => {
      if (!deferredPrompt) return;
      button.disabled = true;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch {}
      deferredPrompt = null;
      button.remove();
    };
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.querySelector('.pwa-install')?.remove();
  });

  function setOfflineState() {
    const existing = document.querySelector('.pwa-offline-badge');
    if (navigator.onLine) { existing?.remove(); return; }
    if (existing) return;
    const badge = document.createElement('div');
    badge.className = 'pwa-offline-badge';
    badge.textContent = 'Offline • saved Vida pages available';
    badge.setAttribute('role', 'status');
    document.body.appendChild(badge);
  }

  window.addEventListener('online', setOfflineState);
  window.addEventListener('offline', setOfflineState);
  document.addEventListener('DOMContentLoaded', () => { addDock(); setOfflineState(); });
})();
