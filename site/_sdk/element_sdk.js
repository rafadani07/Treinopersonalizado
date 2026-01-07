// Placeholder element SDK for GitHub Pages deployment
window.elementSdk = {
  createToast(msg) {
    console.warn('Toast:', msg);
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.bottom = '16px';
    el.style.right = '16px';
    el.style.padding = '8px 12px';
    el.style.background = 'rgba(0,0,0,0.6)';
    el.style.color = 'white';
    el.style.borderRadius = '8px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
};
