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

    const evt = detectContactEvent(a.getAttribute('href'));
    if (!evt) return;

    const g = gtagSafe();
    console.log('[GA4] contact event →', evt.name, a.href); // видимий лог у консолі

    if (g){
      g('event', evt.name, {
        event_category: 'contact',
        event_label: evt.label,
        value: 1,
        transport_type: 'beacon',
        debug_mode: true,
        send_to: MEASUREMENT_ID
      });
    }

    // Якщо відкриваємо в тій же вкладці — дамо час відправити подію
    if (!a.target || a.target === '_self') {
      e.preventDefault();
      const url = a.href;
      setTimeout(() => { window.location.href = url; }, 200);
    }
    // target=_blank не блокуємо
  }, true);
})();
