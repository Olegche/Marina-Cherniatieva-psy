// === Contact Conversion Tracking ===
(function attachContactTracking(){
  function detectContactEvent(href){
    if (!href) return null;
    const url = href.toLowerCase();
    if (url.startsWith('tel:')) return {name:'phone_click', label:'Phone'};
    if (url.startsWith('viber://') || url.includes('viber.com')) return {name:'viber_click', label:'Viber'};
    if (url.includes('t.me') || url.includes('telegram.me')) return {name:'telegram_click', label:'Telegram'};
    return null;
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const evt = detectContactEvent(a.getAttribute('href'));
    if (!evt) return;

    // Відправляємо подію в GA4
    gtag('event', evt.name, {
      event_category: 'contact',
      event_label: evt.label,
      value: 1,
      transport_type: 'beacon'
    });

    // Для переходів у тій же вкладці — невелика затримка
    if (!a.target || a.target === '_self') {
      e.preventDefault();
      const url = a.href;
      setTimeout(() => { window.location.href = url; }, 120);
    }
  }, true);
})();
