// === Contact Conversion Tracking (GA4, robust for app schemes) ===
(function attachContactTracking(){
  const MEASUREMENT_ID = 'G-B3JKC8WZQB';

  // класифікуємо тип лінка
  function getContactEvent(href=''){
    const url = href.toLowerCase();
    if (url.startsWith('tel:'))                         return {name:'phone_click',    label:'Phone',  kind:'app'};
    if (url.startsWith('viber://') || url.includes('viber.com'))
                                                        return {name:'viber_click',    label:'Viber',  kind:'app'};
    if (url.includes('t.me') || url.includes('telegram.me'))
                                                        return {name:'telegram_click', label:'Telegram', kind:'web'};
    return null;
  }

  function sendGA(evt){
    if (typeof gtag !== 'function') return;
    gtag('event', evt.name, {
      event_category: 'contact',
      event_label: evt.label,
      value: 1,
      transport_type: 'beacon',
      debug_mode: true,
      send_to: MEASUREMENT_ID
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const evt = getContactEvent(a.getAttribute('href') || '');
    if (!evt) return;

    // 1) шлемо подію
    console.log('[GA4] contact event →', evt.name, a.href);
    sendGA(evt);

    // 2) даємо час на відправку, особливо для app-схем
    const isApp = evt.kind === 'app';
    const delay = isApp ? 650 : 250; // <- ключ: 650мс для tel:/viber://

    e.preventDefault();
    const open = () => {
      if (a.target && a.target !== '_self') {
        window.open(a.href, a.target, 'noopener');
      } else {
        window.location.href = a.href;
      }
    };
    setTimeout(open, delay);
  }, true);
})();
