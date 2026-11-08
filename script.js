// /script.js
(() => {
  'use strict';

  const onReady = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  onReady(() => {
    // 1) Рік у футері
    const yearEl = document.getElementById('y');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2) Reveal: показати один раз
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          }
        },
        // чому: threshold 0.2 вимагав 20% площі елемента — високі секції
        // (напр. #services з 9 картками) з'являлись лише після довгого скролу.
        // Тепер вистачає першого пікселя, ще й з випередженням на 15% екрана.
        { threshold: 0, rootMargin: '0px 0px 15% 0px' }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('visible'));
    }

    // 3) CTA "Запис на консультацію" — залишаємо твою поведінку
    const mainBtn = document.getElementById('main-btn');
    const altBtns = document.getElementById('alt-buttons');
    if (mainBtn && altBtns) {
      const fadeBtns = altBtns.querySelectorAll('.fade');
      mainBtn.addEventListener(
        'click',
        (e) => {
          if (mainBtn.tagName === 'A') e.preventDefault(); // чому: не стрибати на "#"
          mainBtn.style.display = 'none';
          altBtns.style.display = 'flex';
          fadeBtns.forEach((btn, i) => {
            btn.classList.remove('show');
            setTimeout(() => btn.classList.add('show'), i * 950);
          });
        },
        { passive: false }
      );
    }

    // 4) Swiper (з розблокованими кліками)
    let swiper;
    if (window.Swiper && document.querySelector('.swiper')) {
      swiper = new Swiper('.swiper', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } },
        preventClicks: false,
        preventClicksPropagation: false,
        keyboard: { enabled: true },
        a11y: { enabled: true }
      });
    } else {
      console.warn('Swiper not found or .swiper missing');
    }

    // 5) Лайтбокс
    const lightboxEl = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightboxEl && lightboxImg) {
      // Створити кнопку закриття, якщо відсутня
      let closeBtn = lightboxEl.querySelector('.close');
      if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        lightboxEl.appendChild(closeBtn);
      }

      const openLightbox = (img) => {
        // Підстраховка проти [hidden]
        lightboxEl.removeAttribute('hidden');
        lightboxEl.style.display = 'flex';
        lightboxEl.classList.add('open');

        var webpOK = !!(window.CSS && CSS.supports &&
          CSS.supports('background-image', 'image-set(url("a.webp") type("image/webp"))'));
        lightboxImg.src = (webpOK && img.getAttribute('data-large-webp'))
          || img.getAttribute('data-large') || img.getAttribute('src') || '';
        lightboxImg.alt = img.getAttribute('alt') || '';
        document.body.style.overflow = 'hidden'; // чому: блокуємо скрол позаду

        if (swiper?.autoplay?.stop) {
          try { swiper.autoplay.stop(); } catch (_) {}
        }
      };

      const closeLightbox = () => {
        lightboxEl.classList.remove('open');
        lightboxEl.style.display = 'none';
        // Якщо хочеш повертати hidden — розкоментуй наступний рядок:
        // lightboxEl.setAttribute('hidden', '');
        document.body.style.overflow = '';
        lightboxImg.src = '';
        if (swiper?.autoplay?.start) {
          try { swiper.autoplay.start(); } catch (_) {}
        }
      };

      // Закриття
      closeBtn.addEventListener('click', closeLightbox);
      lightboxEl.addEventListener('click', (e) => {
        if (e.target === lightboxEl) closeLightbox(); // клік по бекдропу
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
      });

      // Делегація кліків по прев’юшках (у capture, щоб Swiper не з’їв клік)
      const swiperContainer = document.querySelector('#certificates .swiper') || document;
      swiperContainer.addEventListener(
        'click',
        (e) => {
          const thumb = e.target && e.target.closest('img.cert-thumb');
          if (!thumb) return;
          e.preventDefault();
          openLightbox(thumb);
        },
        true // capture
      );

      // Початково приховано
      lightboxEl.style.display = 'none';
    }

    // 6) Навбар бургер (працює тільки якщо є елементи)
    const burger = document.getElementById('burger');
    const menu = document.getElementById('nav-menu');
    const backdrop = document.getElementById('nav-backdrop');
    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

    function toggleMenu(force) {
      if (!burger || !menu) return;
      const open = typeof force === 'boolean' ? force : burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      if (!isDesktop()) menu.hidden = !open;
      if (backdrop) backdrop.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (burger && menu) {
      burger.addEventListener('click', () => toggleMenu());
      backdrop?.addEventListener('click', () => toggleMenu(false));
      menu.addEventListener('click', (e) => {
        if (e.target.matches('.nav-links a')) toggleMenu(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(false);
      });
      window.addEventListener('resize', () => {
        if (isDesktop()) {
          burger.setAttribute('aria-expanded', 'false');
          menu.classList.remove('open');
          menu.hidden = false;
          backdrop && (backdrop.hidden = true);
          document.body.style.overflow = '';
        } else if (!menu.classList.contains('open')) {
          menu.hidden = true;
        }
      });
    }

    // 7) "Про мене": читати повністю / згорнути
    const aboutToggle = document.getElementById('about-toggle');
    const aboutMore = document.getElementById('about-more');
    if (aboutToggle && aboutMore) {
      const aboutBox = aboutToggle.closest('.about-box');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let aboutAnim = null;
      const setAboutOpen = (open, animate = false) => {
        aboutToggle.setAttribute('aria-expanded', String(open));
        aboutToggle.textContent = open ? 'Згорнути' : 'Читати повністю';
        aboutBox?.classList.toggle('collapsed', !open);
        aboutAnim?.cancel();
        if (!animate || reduceMotion.matches || !aboutMore.animate) {
          aboutMore.hidden = !open;
          return;
        }
        // плавне розгортання/згортання: висота + проява тексту
        aboutMore.hidden = false;
        const h = aboutMore.scrollHeight;
        aboutAnim = aboutMore.animate(
          open
            ? [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }]
            : [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: open ? 480 : 360, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
        aboutAnim.onfinish = () => { aboutAnim = null; if (!open) aboutMore.hidden = true; };
      };
      setAboutOpen(false);
      aboutToggle.addEventListener('click', () => {
        const open = aboutToggle.getAttribute('aria-expanded') !== 'true';
        setAboutOpen(open, true);
        // чому: після згортання сторінка різко коротшає — повертаємо початок блоку у видиму зону
        if (!open) aboutBox?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // 8) FAQ accordion: only one open at a time
    const faqItems = document.querySelectorAll('#faq .faq-item');
    if (faqItems.length) {
      faqItems.forEach((item) => {
        item.addEventListener('toggle', () => {
          if (!item.open) return;
          faqItems.forEach((other) => {
            if (other !== item) other.open = false;
          });
        });
      });
    }
  });
})();

// ========== Темна тема ==========

(() => {
  const KEY = 'theme';
  const root = document.documentElement;
  const metaTheme = () => document.querySelector('meta[name="theme-color"]');

  const setPressed = (isDark) => {
    document.querySelectorAll('#theme-toggle, #theme-toggle-floating')
      .forEach((btn) => btn && btn.setAttribute('aria-pressed', String(isDark)));
  };

  const applyTheme = (isDark) => {
    root.classList.toggle('theme-dark', isDark);
    metaTheme()?.setAttribute('content', isDark ? '#0d1014' : '#00d1b2');
    setPressed(isDark);
  };

  const saved = localStorage.getItem(KEY); // 'dark' | 'light' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);

  // Слухаємо кліки з обох кнопок (мобільна в navbar і десктопна плаваюча)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#theme-toggle, #theme-toggle-floating')) return;
    const next = !root.classList.contains('theme-dark');
    applyTheme(next);
    localStorage.setItem(KEY, next ? 'dark' : 'light');
  });

  // Якщо користувач не обирав явно — реагувати на системну зміну
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (!saved && mql?.addEventListener) {
    mql.addEventListener('change', (ev) => applyTheme(ev.matches));
  }
})();

function initTheme() {
  const userPref = localStorage.getItem('theme');
  if (userPref) {
    document.body.classList.toggle('dark', userPref === 'dark');
    updateToggleIcon(userPref);
  } else {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', systemDark);
    updateToggleIcon(systemDark ? 'dark' : 'light');
  }
}

function updateToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Додаємо короткий клас для плавної анімації
function withThemeTransition(fn){
  document.body.classList.add('theme-transition');
  window.requestAnimationFrame(()=>{
    fn(); // виконуємо зміну теми
    setTimeout(()=> document.body.classList.remove('theme-transition'), 380); // трохи більше за CSS .35s
  });
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  withThemeTransition(() => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateToggleIcon(isDark ? 'dark' : 'light');
  });
});

// Якщо системна тема зміниться «на льоту» — синхронізуємось,
// але не ламаємо вибір користувача (лише якщо він ще не задавав свою).
const media = window.matchMedia('(prefers-color-scheme: dark)');
media.addEventListener?.('change', e => {
  if (localStorage.getItem('theme')) return; // користувач явно обрав — не чіпаємо
  withThemeTransition(() => {
    document.body.classList.toggle('dark', e.matches);
    updateToggleIcon(e.matches ? 'dark' : 'light');
  });
});

initTheme();

// ========== Живий фон: зорі (темна тема) / конюшина (світла тема) ==========
// Canvas позаду контенту: елементи повільно проявляються, м'яко мерехтять,
// три шари рухаються з різною швидкістю при скролі (паралакс) і трохи за курсором.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDark = () => root.classList.contains('theme-dark');

  let canvas, ctx, items = [], w = 0, h = 0, dpr = 1;
  let mode = null; // 'stars' | 'clover'
  let rafId = 0, running = false, startTime = 0, switchTimer = 0;
  let scrollY = window.scrollY, smoothScroll = scrollY;
  let mouseX = 0, mouseY = 0, smoothMX = 0, smoothMY = 0;
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- Зорі ----------
  // Шари: глибина = сила паралаксу; дальні — дрібні й тьмяні, ближні — більші й яскравіші
  const STAR_LAYERS = [
    { depth: 0.04, share: 0.55, size: [0.35, 0.8],  alpha: [0.25, 0.55] },
    { depth: 0.10, share: 0.32, size: [0.6, 1.15],  alpha: [0.4, 0.75] },
    { depth: 0.20, share: 0.13, size: [0.9, 1.6],   alpha: [0.6, 0.95] },
  ];
  const TINTS = ['255,255,255', '255,255,255', '255,255,255', '214,236,255', '196,255,240', '255,244,214'];

  // Заготовка «сяйва» зірки — малюємо один раз, далі лише drawImage (швидко)
  const starGlow = document.createElement('canvas');
  starGlow.width = starGlow.height = 32;
  (() => {
    const g = starGlow.getContext('2d');
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(0.35, 'rgba(200,240,255,0.15)');
    grad.addColorStop(1, 'rgba(200,240,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
  })();

  // ---------- Конюшина ----------
  const CLOVER_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [14, 20], alpha: [0.22, 0.32] },
    { depth: 0.12, share: 0.33, size: [20, 28], alpha: [0.3, 0.42] },
    { depth: 0.22, share: 0.17, size: [28, 38], alpha: [0.38, 0.52] },
  ];
  const SPRITE = 160; // розмір заготовки листка в px (рендеримо великим, малюємо зменшеним — без «мила»)

  // Один листок-сердечко: вістря в (0,0), лопаті вгорі
  function leafPath(g, s) {
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(-0.58 * s, -0.22 * s, -0.7 * s, -0.98 * s, -0.3 * s, -1.02 * s);
    g.bezierCurveTo(-0.11 * s, -1.04 * s, -0.02 * s, -0.94 * s, 0, -0.8 * s);
    g.bezierCurveTo(0.02 * s, -0.94 * s, 0.11 * s, -1.04 * s, 0.3 * s, -1.02 * s);
    g.bezierCurveTo(0.7 * s, -0.98 * s, 0.58 * s, -0.22 * s, 0, 0);
    g.closePath();
  }

  function makeClover(leaves, gold = false) {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE;
    const g = c.getContext('2d');
    const cx = SPRITE / 2, cy = SPRITE / 2, s = SPRITE * 0.27;
    g.translate(cx, cy);

    // стеблинка
    g.strokeStyle = '#3f9a5c';
    g.lineWidth = SPRITE * 0.035;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(s * 0.35, s * 0.9, s * 0.15, s * 1.55);
    g.stroke();

    const step = (Math.PI * 2) / leaves;
    const offset = leaves === 4 ? Math.PI / 4 : 0;
    for (let i = 0; i < leaves; i++) {
      g.save();
      g.rotate(offset + i * step);
      const grad = g.createLinearGradient(0, 0, 0, -s);
      grad.addColorStop(0, '#2f9457');
      grad.addColorStop(1, '#5ec98a');
      leafPath(g, s);
      g.fillStyle = grad;
      g.fill();
      // світла «галочка», як на справжньому листку конюшини
      g.strokeStyle = 'rgba(225,255,235,0.55)';
      g.lineWidth = SPRITE * 0.018;
      g.beginPath();
      g.moveTo(-0.3 * s, -0.62 * s);
      g.quadraticCurveTo(0, -0.42 * s, 0.3 * s, -0.62 * s);
      g.stroke();
      // прожилка
      g.strokeStyle = 'rgba(30,110,60,0.35)';
      g.lineWidth = SPRITE * 0.012;
      g.beginPath();
      g.moveTo(0, -0.05 * s);
      g.lineTo(0, -0.74 * s);
      g.stroke();
      // золотий кант по краю листка (лише чотирилистник)
      if (gold) {
        const edge = g.createLinearGradient(-s, -s, s, 0);
        edge.addColorStop(0, '#fff3c2');
        edge.addColorStop(0.35, '#e9b949');
        edge.addColorStop(0.65, '#b8821c');
        edge.addColorStop(1, '#f7d97c');
        leafPath(g, s);
        g.strokeStyle = edge;
        g.lineWidth = SPRITE * 0.024;
        g.lineJoin = 'round';
        g.stroke();
      }
      g.restore();
    }
    return c;
  }

  const clover3 = makeClover(3);
  const clover4 = makeClover(4, true);

  // Золоте світіння, що облягає силует чотирилистника (без «плями» всередині)
  const goldHalo = document.createElement('canvas');
  goldHalo.width = goldHalo.height = SPRITE;
  (() => {
    const g = goldHalo.getContext('2d');
    const s = SPRITE * 0.27;
    const silhouette = () => {
      for (let i = 0; i < 4; i++) {
        g.save();
        g.rotate(Math.PI / 4 + i * Math.PI / 2);
        leafPath(g, s);
        g.fill();
        g.restore();
      }
    };
    g.translate(SPRITE / 2, SPRITE / 2);
    g.fillStyle = 'rgb(255,204,80)';
    g.shadowColor = 'rgba(255,180,40,1)';
    g.shadowBlur = SPRITE * 0.07;
    silhouette();
    silhouette(); // двічі — щільніше світіння біля краю
    // вирізаємо сам силует: лишається тільки ореол навколо контуру
    g.shadowColor = 'transparent';
    g.globalCompositeOperation = 'destination-out';
    silhouette();
  })();

  // Іскорка-зірочка з чотирма променями
  const sparkle = document.createElement('canvas');
  sparkle.width = sparkle.height = 48;
  (() => {
    const g = sparkle.getContext('2d');
    g.translate(24, 24);
    const core = g.createRadialGradient(0, 0, 0, 0, 0, 10);
    core.addColorStop(0, 'rgba(255,255,240,1)');
    core.addColorStop(0.3, 'rgba(255,215,110,0.8)');
    core.addColorStop(1, 'rgba(255,190,60,0)');
    g.fillStyle = core;
    g.fillRect(-10, -10, 20, 20);
    for (let i = 0; i < 2; i++) {
      g.save();
      g.rotate(i * Math.PI / 2);
      const ray = g.createLinearGradient(-24, 0, 24, 0);
      ray.addColorStop(0, 'rgba(255,200,80,0)');
      ray.addColorStop(0.5, 'rgba(255,248,220,1)');
      ray.addColorStop(1, 'rgba(255,200,80,0)');
      g.fillStyle = ray;
      g.beginPath();
      g.moveTo(-24, 0); g.lineTo(0, -1.6); g.lineTo(24, 0); g.lineTo(0, 1.6);
      g.closePath();
      g.fill();
      g.restore();
    }
  })();

  // ---------- Побудова ----------
  function buildStars() {
    // Щільність від площі екрана, з обмеженням (чому: продуктивність на великих моніторах)
    const total = Math.min(420, Math.round((w * h) / 5200));
    items = [];
    STAR_LAYERS.forEach((layer, li) => {
      const n = Math.round(total * layer.share);
      for (let i = 0; i < n; i++) {
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          tint: TINTS[(Math.random() * TINTS.length) | 0],
          born: rand(0, 7),            // коли почне проявлятися, с
          fade: rand(2.5, 5),          // скільки триває проява, с
          speed: rand(0.25, 0.9),      // швидкість мерехтіння, рад/с
          phase: rand(0, Math.PI * 2),
          twinkle: rand(0.35, 0.8),    // глибина мерехтіння
        });
      }
    });
  }

  function buildClovers() {
    // чому: листки великі — їх значно менше, ніж зірок, щоб фон не відволікав від тексту
    const total = Math.min(60, Math.round((w * h) / 26000));
    items = [];
    CLOVER_LAYERS.forEach((layer, li) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const lucky = Math.random() < 0.18; // ~кожен п'ятий-шостий — чотирилистник
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]) * (lucky ? 1.1 : 1),
          // чому: чотирилистник має бути помітним — він яскравіший за звичайні листки
          a: lucky ? rand(0.62, 0.82) : rand(layer.alpha[0], layer.alpha[1]),
          lucky,
          sparks: lucky ? Array.from({ length: 3 }, (_, k) => ({
            ang: (k / 3) * Math.PI * 2 + rand(-0.5, 0.5),
            dist: rand(0.5, 0.72),     // відстань від центру, частка розміру
            size: rand(0.28, 0.42),    // розмір іскорки, частка розміру листка
            speed: rand(0.7, 1.2),
            phase: rand(0, Math.PI * 2),
          })) : null,
          rot: rand(0, Math.PI * 2),
          spin: rand(-0.06, 0.06),     // повільне обертання, рад/с
          sway: rand(0.15, 0.35),      // легке погойдування
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.3, 0.8),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  const build = () => (mode === 'stars' ? buildStars() : buildClovers());

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'starfield';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nw = window.innerWidth, nh = window.innerHeight;
    // чому: на мобільних адресний рядок змінює висоту при скролі — не перегенеровуємо через дрібниці
    const rebuild = Math.abs(nw - w) > 40 || Math.abs(nh - h) > 160 || !items.length;
    w = nw; h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (rebuild) build();
    if (!running) draw(performance.now());
  }

  // ---------- Малювання ----------
  const appearOf = (s, t, still) => {
    if (still) return 1;
    const p = Math.min(1, Math.max(0, (t - s.born) / s.fade));
    return p * p * (3 - 2 * p); // smoothstep — м'який старт і фініш
  };

  // загортаємо координати — поле нескінченне в обидва боки
  const wrap = (v, size, pad) => ((v + pad) % (size + pad * 2) + size + pad * 2) % (size + pad * 2) - pad;

  function drawStars(t, still) {
    for (const s of items) {
      const ease = appearOf(s, t, still);
      if (ease <= 0) continue;
      const tw = still ? 1 : 1 - s.twinkle * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const alpha = s.a * ease * tw;
      if (alpha < 0.01) continue;

      const ox = still ? 0 : smoothMX * s.depth * 60;
      const oy = still ? 0 : -smoothScroll * s.depth + smoothMY * s.depth * 40;
      const x = wrap(s.x + ox, w, 0);
      const y = wrap(s.y + oy, h, 0);

      if (s.r > 1.05) {
        const gs = s.r * 9;
        ctx.globalAlpha = alpha * 0.8;
        ctx.drawImage(starGlow, x - gs / 2, y - gs / 2, gs, gs);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${s.tint})`;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawClovers(t, still) {
    for (const c of items) {
      const ease = appearOf(c, t, still);
      if (ease <= 0) continue;

      const ox = still ? 0 : smoothMX * c.depth * 60;
      const oy = still ? 0 : -smoothScroll * c.depth + smoothMY * c.depth * 40;
      const pad = c.size * 2;
      const x = wrap(c.x + ox, w, pad);
      const y = wrap(c.y + oy, h, pad);
      const rot = still ? c.rot : c.rot + t * c.spin + Math.sin(t * c.speed * 0.6 + c.phase) * c.sway;
      // листок «дихає» ледь помітно, золоте сяйво мерехтить сильніше
      const pulse = still ? 1 : 0.5 + 0.5 * Math.sin(t * c.speed + c.phase);

      const sprite = c.lucky ? clover4 : clover3;
      const ds = c.size * (SPRITE / (SPRITE * 0.27)) * 0.5; // розмір спрайта під бажаний розмір листка
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      if (c.lucky) {
        // золотий ореол по контуру — плавно «дихає»
        ctx.globalAlpha = ease * (0.55 + 0.45 * pulse);
        ctx.drawImage(goldHalo, -ds / 2, -ds / 2, ds, ds);
      }

      ctx.globalAlpha = c.a * ease * (still ? 1 : 0.88 + 0.12 * pulse);
      ctx.drawImage(sprite, -ds / 2, -ds / 2, ds, ds);

      if (c.lucky && !still) {
        // іскорки біля листка спалахують по черзі й повільно згасають
        for (const sp of c.sparks) {
          const k = Math.max(0, Math.sin(t * sp.speed + sp.phase));
          const a = ease * k * k * k;
          if (a < 0.02) continue;
          const sz = c.size * sp.size * (0.6 + 0.4 * k);
          const px = Math.cos(sp.ang) * c.size * sp.dist;
          const py = Math.sin(sp.ang) * c.size * sp.dist;
          ctx.globalAlpha = a;
          ctx.drawImage(sparkle, px - sz / 2, py - sz / 2, sz, sz);
        }
      }
      ctx.restore();
    }
  }

  function draw(now) {
    const t = (now - startTime) / 1000;
    const still = reduceMotion.matches;
    if (!still) {
      smoothScroll += (scrollY - smoothScroll) * 0.08;
      smoothMX += (mouseX - smoothMX) * 0.04;
      smoothMY += (mouseY - smoothMY) * 0.04;
    }
    ctx.clearRect(0, 0, w, h);
    if (mode === 'stars') drawStars(t, still); else drawClovers(t, still);
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Керування ----------
  function show(nextMode) {
    mode = nextMode;
    if (!canvas) createCanvas();
    items = [];
    resize();                       // перебудує елементи під новий режим
    startTime = performance.now();  // нова повільна проява
    smoothScroll = scrollY = window.scrollY;
    requestAnimationFrame(() => canvas.classList.add('is-on'));
    if (reduceMotion.matches) { running = false; cancelAnimationFrame(rafId); draw(startTime); return; }
    if (!running) { running = true; rafId = requestAnimationFrame(loop); }
  }

  function sync() {
    const next = isDark() ? 'stars' : 'clover';
    if (next === mode) return;
    clearTimeout(switchTimer);
    if (!canvas || !mode) { show(next); return; }
    // плавно гасимо поточний фон, тоді проявляємо новий
    canvas.classList.remove('is-on');
    switchTimer = setTimeout(() => show(isDark() ? 'stars' : 'clover'), 700);
  }

  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', () => canvas && resize());
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  reduceMotion.addEventListener?.('change', () => mode && show(mode));

  sync();
})();
