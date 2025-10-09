// === Contact Conversion Tracking (GA4, robust) ===
(function attachContactTracking(){
  const MID = 'G-B3JKC8WZQB';

  const getEvt = (href='') => {
    const u = href.toLowerCase();
    if (u.startsWith('tel:')) return {name:'phone_click', label:'Phone', kind:'app'};
    if (u.startsWith('viber://') || u.includes('viber.com'))
      return {name:'viber_click', label:'Viber', kind:'app'};
    if (u.includes('t.me') || u.includes('telegram.me'))
      return {name:'telegram_click', label:'Telegram', kind:'web'};
    return null;
  };

  const sendGA = (evt, onDone) => {
    if (typeof gtag !== 'function') { onDone?.(); return; }
    gtag('event', evt.name, {
      event_category: 'contact',
      event_label: evt.label,
      value: 1,
      transport_type: 'beacon',
      debug_mode: true,
      send_to: MID,
      // 👇 GA викличе це, коли подію відправлено
      event_callback: () => onDone?.(),
      // 👇 якщо не встигло — страховка
      event_timeout: 800
    });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const evt = getEvt(a.getAttribute('href') || '');
    if (!evt) return;

    console.log('[GA4] contact event →', evt.name, a.href);

    // притримуємо перехід, поки GA не скаже "відправлено" або не спливе таймаут
    e.preventDefault();
    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      if (a.target && a.target !== '_self') {
        window.open(a.href, a.target, 'noopener');
      } else {
        window.location.href = a.href;
      }
    };

    // для app-схем даємо трохи більше часу
    const safety = setTimeout(go, evt.kind === 'app' ? 900 : 350);
    sendGA(evt, () => { clearTimeout(safety); go(); });
  }, true);
})();
