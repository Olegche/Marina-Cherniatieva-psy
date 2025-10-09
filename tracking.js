// === Contact Conversion Tracking (GA4) ===
(function attachContactTracking(){
  const MEASUREMENT_ID = 'G-B3JKC8WZQB'; // щоб явно вказати send_to

  // іноді буває, що tracking.js підключили до завантаження gtag()
  function gtagSafe(){
    if (typeof gtag === 'function') return gtag;
    console.warn('gtag() not ready yet');
    return null;
  }

  function detectContactEvent(href){
    if (!href) return null;
    const url = href.toLowerCase();
    if (url.startsWith('tel:'))            return {name:'phone_click',    label:'Phone'};
    if (url.startsWith('viber://') || url.includes('viber.com'))
                                           return {name:'viber_click',    label:'Viber'};
    if (url.includes('t.me') || url.includes('telegram.me'))
                                           return {name:'telegram_click', label:'Telegram'};
    return null;
  }

  document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;

  const href = a.getAttribute('href') || '';
  const url = href.toLowerCase();

  // визначаємо контактні події
  let evt = null;
  if (url.startsWith('tel:')) evt = { name: 'phone_click', label: 'Phone' };
  else if (url.startsWith('viber://') || url.includes('viber.com')) evt = { name: 'viber_click', label: 'Viber' };
  else if (url.includes('t.me') || url.includes('telegram.me')) evt = { name: 'telegram_click', label: 'Telegram' };

  if (!evt) return;

  // лог + відправка у GA4
  console.log('[GA4] contact event →', evt.name, a.href);
  gtag('event', evt.name, {
    event_category: 'contact',
    event_label: evt.label,
    value: 1,
    transport_type: 'beacon',
    debug_mode: true,
    send_to: 'G-B3JKC8WZQB'
  });

  // завжди даємо коротку паузу перед відкриттям (особливо важливо для viber:// та tel:)
  e.preventDefault();
  const open = () => {
    if (a.target && a.target !== '_self') {
      // поважаємо target, додаємо безпечний параметр
      window.open(a.href, a.target, 'noopener');
    } else {
      window.location.href = a.href;
    }
  };
  setTimeout(open, 300);
}, true);

})();
