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
  // за замовчуванням — темна тема (незалежно від системних налаштувань); вибір користувача зберігається
  applyTheme(saved ? saved === 'dark' : true);

  // Слухаємо кліки з обох кнопок (мобільна в navbar і десктопна плаваюча)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#theme-toggle, #theme-toggle-floating')) return;
    const next = !root.classList.contains('theme-dark');
    applyTheme(next);
    localStorage.setItem(KEY, next ? 'dark' : 'light');
  });


})();

function initTheme() {
  const userPref = localStorage.getItem('theme');
  if (userPref) {
    document.body.classList.toggle('dark', userPref === 'dark');
    updateToggleIcon(userPref);
  } else {
    // за замовчуванням — темна тема (узгоджено з html.theme-dark вище)
    document.body.classList.add('dark');
    updateToggleIcon('dark');
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

initTheme();

// ========== Живий фон: зорі (темна тема) / конюшина (світла тема) ==========
// Canvas позаду контенту: елементи повільно проявляються, м'яко мерехтять,
// три шари рухаються з різною швидкістю при скролі (паралакс) і трохи за курсором.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDark = () => root.classList.contains('theme-dark');

  let canvas, ctx, items = [], w = 0, h = 0, dpr = 1;
  let mode = null; // 'stars' | 'clover' | 'petals' | 'hearts' | 'romance'
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

  // ---------- Пелюстки (світла) і сердечка (темна) — сторінка сексології ----------
  const FLOAT_SPRITE = 96;
  const spriteCache = {};
  const cached = (key, make) => spriteCache[key] || (spriteCache[key] = make());

  function makeSprite(drawFn) {
    const c = document.createElement('canvas');
    c.width = c.height = FLOAT_SPRITE;
    const g = c.getContext('2d');
    g.translate(FLOAT_SPRITE / 2, FLOAT_SPRITE / 2);
    drawFn(g, FLOAT_SPRITE);
    return c;
  }

  // Пелюстка: заокруглена краплина з ледь помітною виїмкою вгорі
  const PETAL_TONES = [
    ['#fff1f3', '#f6c3cf', '#e79aae'],   // пудрово-рожева
    ['#fff4ee', '#f8cdbb', '#eaa58f'],   // персикова
    ['#fdf0f6', '#efbdd3', '#d993b4'],   // ніжна трояндова
  ];
  const makePetal = (tone) => makeSprite((g, P) => {
    const [hi, mid, lo] = tone;
    g.beginPath();
    g.moveTo(0, 0.42 * P);
    g.bezierCurveTo(-0.34 * P, 0.2 * P, -0.36 * P, -0.3 * P, -0.1 * P, -0.4 * P);
    g.quadraticCurveTo(0, -0.33 * P, 0.1 * P, -0.4 * P);
    g.bezierCurveTo(0.36 * P, -0.3 * P, 0.34 * P, 0.2 * P, 0, 0.42 * P);
    g.closePath();
    const grad = g.createRadialGradient(-0.06 * P, -0.18 * P, 0, 0, 0, 0.5 * P);
    grad.addColorStop(0, hi);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, lo);
    g.fillStyle = grad;
    g.fill();
    // тонка серединна жилка
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = P * 0.012;
    g.beginPath();
    g.moveTo(0, 0.36 * P);
    g.quadraticCurveTo(0.03 * P, 0, 0, -0.28 * P);
    g.stroke();
  });

  // Сердечко з м'яким об'ємом і відблиском
  const HEART_TONES = [
    ['#ffe1e8', '#f58fab', '#d9466f'],   // троянда
    ['#ffe9e4', '#f6a69a', '#d9645a'],   // корал
    ['#fff0e0', '#f3c08f', '#d98e4f'],   // тепле золото
  ];
  function heartPath(g, s) {
    g.beginPath();
    g.moveTo(0, 0.9 * s);
    g.bezierCurveTo(-1.25 * s, 0.05 * s, -0.95 * s, -1.0 * s, 0, -0.42 * s);
    g.bezierCurveTo(0.95 * s, -1.0 * s, 1.25 * s, 0.05 * s, 0, 0.9 * s);
    g.closePath();
  }
  const makeHeart = (tone) => makeSprite((g, P) => {
    const [hi, mid, lo] = tone;
    const s = P * 0.42;
    heartPath(g, s);
    const grad = g.createRadialGradient(-0.3 * s, -0.4 * s, 0, 0, 0, 1.1 * s);
    grad.addColorStop(0, hi);
    grad.addColorStop(0.5, mid);
    grad.addColorStop(1, lo);
    g.fillStyle = grad;
    g.fill();
    // відблиск на лівій «половинці»
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.ellipse(-0.42 * s, -0.42 * s, 0.16 * s, 0.09 * s, -0.7, 0, Math.PI * 2);
    g.fill();
  });
  const makeWarmGlow = () => makeSprite((g, P) => {
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, P / 2);
    grad.addColorStop(0, 'rgba(255,190,200,0.45)');
    grad.addColorStop(0.4, 'rgba(255,170,150,0.14)');
    grad.addColorStop(1, 'rgba(255,170,150,0)');
    g.fillStyle = grad;
    g.fillRect(-P / 2, -P / 2, P, P);
  });

  // ---------- Шматочки пазла — сторінка тренінгів ----------
  // Кольори: м'ятний (як на сайті), золотий, небесний, кораловий — [світлий, основний, контур]
  const PUZZLE_TONES = [
    ['#bff0e5', '#5fd0b9', '#2a9e88'],
    ['#fbe9bd', '#e9c26a', '#b98a2c'],
    ['#d6eafb', '#8ec3ee', '#4b8fc6'],
    ['#fde0d7', '#f2a593', '#cf7560'],
  ];
  // Типи країв (верх, право, низ, ліво): 1 — виступ, -1 — виїмка, 0 — рівний край
  const PUZZLE_SHAPES = [[1, -1, -1, 1], [-1, 1, 1, -1], [1, 1, -1, -1], [1, -1, 0, 1]];

  // один край шматочка від (0,0) до (a,0); «назовні» — це -y
  function puzzleEdge(g, a, t) {
    if (!t) { g.lineTo(a, 0); return; }
    g.lineTo(0.37 * a, 0);
    g.bezierCurveTo(0.42 * a, -t * 0.06 * a, 0.3 * a, -t * 0.25 * a, 0.5 * a, -t * 0.25 * a);
    g.bezierCurveTo(0.7 * a, -t * 0.25 * a, 0.58 * a, -t * 0.06 * a, 0.63 * a, 0);
    g.lineTo(a, 0);
  }
  function puzzlePath(g, a, edges) {
    const h = a / 2;
    const corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
    g.beginPath();
    g.moveTo(-h, -h);
    edges.forEach((t, i) => {
      g.save();                       // шлях не є частиною стану — трансформації лише «повертають» край
      g.translate(corners[i][0], corners[i][1]);
      g.rotate((i * Math.PI) / 2);
      puzzleEdge(g, a, t);
      g.restore();
    });
    g.closePath();
  }
  const makePuzzle = (shape, tone) => makeSprite((g, P) => drawPiece(g, P, P * 0.5, PUZZLE_SHAPES[shape], tone));

  // Один шматочок зі стороною a у поточній системі координат (центр — 0,0)
  function drawPiece(g, P, a, edges, tone) {
    const [hi, mid, edge] = tone;
    puzzlePath(g, a, edges);
    const grad = g.createLinearGradient(-a * 0.7, -a * 0.7, a * 0.7, a * 0.7);
    grad.addColorStop(0, hi);
    grad.addColorStop(1, mid);
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = edge;
    g.lineWidth = P * 0.022;
    g.lineJoin = 'round';
    g.stroke();
    // світлий внутрішній відблиск — шматочок виглядає «картонним», об'ємним
    g.save();
    g.clip();
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.lineWidth = P * 0.03;
    g.translate(P * 0.015, P * 0.015);
    puzzlePath(g, a, edges);
    g.stroke();
    g.restore();
  }

  // ---------- Два зчеплені пазли — сторінка сімейних / парних консультацій ----------
  // Виступ лівого (правий край = 1) точно входить у виїмку правого (лівий край = -1):
  // профіль виступу симетричний, тож при зсуві на сторону a шматочки змикаються без щілини
  const PAIR_SHAPES = [
    [[1, 1, -1, 0], [-1, 0, 1, -1]],
    [[-1, 1, 1, -1], [1, -1, -1, -1]],
    [[0, 1, -1, 1], [1, 1, 0, -1]],
    [[1, 1, 1, -1], [-1, 1, -1, -1]],
  ];
  // у парі — синій і рожевий: двоє різних, що пасують одне одному
  const PAIR_BLUE = [['#dcecfc', '#8fc1ee', '#4a86c0'], ['#e6f1fb', '#a9cff0', '#5f97c9']];
  const PAIR_PINK = [['#fde3ec', '#f4a8c4', '#cf6c92'], ['#fdebf1', '#f6bdd2', '#d784a3']];
  const PAIR_TONES = [
    [PAIR_BLUE[0], PAIR_PINK[0]], [PAIR_PINK[0], PAIR_BLUE[0]],
    [PAIR_BLUE[1], PAIR_PINK[1]], [PAIR_PINK[1], PAIR_BLUE[1]],
  ];
  const makePuzzlePair = (shape, tones) => makeSprite((g, P) => {
    const a = P * 0.3;
    const [left, right] = PAIR_SHAPES[shape];
    g.save();
    g.translate(-a / 2, 0);
    drawPiece(g, P, a, left, tones[0]);
    g.restore();
    g.save();
    g.translate(a / 2, 0);
    drawPiece(g, P, a, right, tones[1]);
    g.restore();
  });
  const PAIR_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [28, 36], alpha: [0.4, 0.52] },
    { depth: 0.12, share: 0.33, size: [36, 48], alpha: [0.48, 0.62] },
    { depth: 0.22, share: 0.17, size: [48, 62], alpha: [0.56, 0.72] },
  ];

  function buildPairs() {
    const total = Math.min(36, Math.round((w * h) / 32000));
    items = [];
    PAIR_LAYERS.forEach((layer) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const shape = (Math.random() * PAIR_SHAPES.length) | 0;
        const tones = (Math.random() * PAIR_TONES.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        const dir = rand(0, Math.PI * 2);
        const v = rand(3, 7) * speedK;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: cached(`pair${shape}-${tones}`, () => makePuzzlePair(shape, PAIR_TONES[tones])),
          glow: null,
          vx: Math.cos(dir) * v,
          vy: Math.sin(dir) * v,
          swayAmp: rand(4, 10),
          swaySpeed: rand(0.2, 0.4),
          rot: rand(0, Math.PI * 2),
          spin: rand(-0.1, 0.1),
          rotAmp: 0,
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: 1.3,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  const PUZZLE_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [14, 20], alpha: [0.3, 0.42] },
    { depth: 0.12, share: 0.33, size: [20, 28], alpha: [0.38, 0.52] },
    { depth: 0.22, share: 0.17, size: [28, 38], alpha: [0.46, 0.62] },
  ];

  // ---------- Пір'їнки й пушинки кульбаби — сторінка індивідуальних консультацій ----------
  // Для світлої теми — приглушені тони (біле на білому не видно), для темної — світлі
  const FEATHER_TONES_LIGHT = [
    ['#e4dbcf', '#c9bba8', '#a08d74'],   // теплий беж
    ['#dde4ec', '#bfcad6', '#8798ab'],   // сіро-блакитний
    ['#dfe6d9', '#c4d0bb', '#8e9f80'],   // шавлія
  ];
  const FEATHER_TONES_DARK = [
    ['#ffffff', '#ece6dc', '#cbbfae'],
    ['#ffffff', '#e3e9f0', '#b8c4d2'],
    ['#ffffff', '#e8eee2', '#bfcab4'],
  ];

  const makeFeather = (tone) => makeSprite((g, P) => {
    const [edge, mid, shaft] = tone;
    // віяло пір'я: трохи несиметричне, як у справжньої пір'їни
    g.beginPath();
    g.moveTo(0, -0.42 * P);
    g.bezierCurveTo(0.12 * P, -0.34 * P, 0.16 * P, -0.05 * P, 0.11 * P, 0.16 * P);
    g.bezierCurveTo(0.08 * P, 0.26 * P, 0.03 * P, 0.3 * P, 0, 0.31 * P);
    g.bezierCurveTo(-0.03 * P, 0.3 * P, -0.07 * P, 0.24 * P, -0.09 * P, 0.14 * P);
    g.bezierCurveTo(-0.13 * P, -0.06 * P, -0.1 * P, -0.33 * P, 0, -0.42 * P);
    g.closePath();
    const grad = g.createLinearGradient(-0.14 * P, 0, 0.16 * P, 0);
    grad.addColorStop(0, edge);
    grad.addColorStop(0.45, mid);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, edge);
    g.fillStyle = grad;
    g.fill();
    // тонкі борідки від стрижня до краю
    g.save();
    g.clip();
    g.strokeStyle = shaft;
    g.globalAlpha = 0.28;
    g.lineWidth = P * 0.008;
    for (let y = -0.36; y < 0.3; y += 0.035) {
      g.beginPath(); g.moveTo(0, y * P); g.lineTo(0.18 * P, (y - 0.09) * P); g.stroke();
      g.beginPath(); g.moveTo(0, y * P); g.lineTo(-0.16 * P, (y - 0.09) * P); g.stroke();
    }
    g.restore();
    // «розщепи» у віялі — характерна деталь пір'їни
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.lineWidth = P * 0.014;
    g.beginPath(); g.moveTo(0.16 * P, -0.12 * P); g.lineTo(0.015 * P, -0.04 * P); g.stroke();
    g.beginPath(); g.moveTo(-0.12 * P, 0.05 * P); g.lineTo(-0.015 * P, 0.12 * P); g.stroke();
    g.restore();
    // стрижень, що виходить нижче віяла
    g.strokeStyle = shaft;
    g.lineWidth = P * 0.016;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, -0.4 * P);
    g.quadraticCurveTo(0.012 * P, 0.05 * P, -0.005 * P, 0.44 * P);
    g.stroke();
    // пух біля основи
    g.globalAlpha = 0.6;
    g.lineWidth = P * 0.01;
    for (const [dx, dy] of [[-0.06, 0.27], [0.06, 0.28], [-0.04, 0.32], [0.05, 0.33]]) {
      g.beginPath();
      g.moveTo(0, 0.3 * P);
      g.quadraticCurveTo(dx * 0.6 * P, (dy - 0.03) * P, dx * P, dy * P);
      g.stroke();
    }
  });

  // Пушинка кульбаби: «парасолька» з тонких променів, ніжка й насінинка
  const makeSeed = (dark) => makeSprite((g, P) => {
    const hair = dark ? 'rgba(255,255,255,0.9)' : 'rgba(132,142,152,0.95)';
    const stem = dark ? 'rgba(235,228,214,0.95)' : 'rgba(128,120,104,0.95)';
    const top = -0.14 * P;
    g.lineCap = 'round';
    g.strokeStyle = hair;
    g.lineWidth = P * 0.013;
    const rays = 15;
    for (let i = 0; i < rays; i++) {
      // промені розходяться віялом угору й убоки
      const ang = -Math.PI + (i / (rays - 1)) * Math.PI + (i % 2 ? 0.05 : -0.05);
      const len = P * (0.3 + (i % 3) * 0.02);
      const ex = Math.cos(ang) * len, ey = top + Math.sin(ang) * len * 0.85;
      g.beginPath();
      g.moveTo(0, top);
      g.quadraticCurveTo(ex * 0.5, top + (ey - top) * 0.62, ex, ey);
      g.stroke();
      // крихітне розгалуження на кінчику
      g.lineWidth = P * 0.009;
      for (const da of [-0.35, 0.35]) {
        g.beginPath();
        g.moveTo(ex, ey);
        g.lineTo(ex + Math.cos(ang + da) * P * 0.05, ey + Math.sin(ang + da) * P * 0.05);
        g.stroke();
      }
      g.lineWidth = P * 0.013;
    }
    // ніжка
    g.strokeStyle = stem;
    g.lineWidth = P * 0.014;
    g.beginPath(); g.moveTo(0, top); g.lineTo(0, 0.24 * P); g.stroke();
    // насінинка
    g.fillStyle = stem;
    g.beginPath();
    g.ellipse(0, 0.32 * P, 0.022 * P, 0.085 * P, 0, 0, Math.PI * 2);
    g.fill();
  });
  const makeCoolGlow = () => makeSprite((g, P) => {
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, P / 2);
    grad.addColorStop(0, 'rgba(235,245,255,0.35)');
    grad.addColorStop(1, 'rgba(235,245,255,0)');
    g.fillStyle = grad;
    g.fillRect(-P / 2, -P / 2, P, P);
  });

  const FEATHER_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [22, 30], alpha: [0.58, 0.7] },
    { depth: 0.12, share: 0.33, size: [30, 40], alpha: [0.66, 0.8] },
    { depth: 0.22, share: 0.17, size: [40, 52], alpha: [0.74, 0.9] },
  ];
  const SEED_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [18, 24], alpha: [0.65, 0.78] },
    { depth: 0.12, share: 0.33, size: [24, 32], alpha: [0.75, 0.88] },
    { depth: 0.22, share: 0.17, size: [32, 42], alpha: [0.85, 0.95] },
  ];

  // Пір'їнки повільно опадають, гойдаючись маятником; пушинки злітають і дрейфують за «вітром»
  function buildAiry() {
    const total = Math.min(44, Math.round((w * h) / 27000));
    items = [];
    FEATHER_LAYERS.forEach((_, li) => {
      const n = Math.max(1, Math.round(total * FEATHER_LAYERS[li].share));
      for (let i = 0; i < n; i++) {
        const feather = Math.random() < 0.42;
        const layer = (feather ? FEATHER_LAYERS : SEED_LAYERS)[li];
        const tone = (Math.random() * 3) | 0;
        const speedK = 0.6 + layer.depth * 3;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: feather ? cached('featherL' + tone, () => makeFeather(FEATHER_TONES_LIGHT[tone]))
                          : cached('seedL', () => makeSeed(false)),
          spriteDark: feather ? cached('featherD' + tone, () => makeFeather(FEATHER_TONES_DARK[tone]))
                              : cached('seedD', () => makeSeed(true)),
          glow: feather ? null : cached('coolGlow', makeCoolGlow),
          vx: feather ? rand(-3, 3) * speedK : rand(5, 11) * speedK,
          vy: feather ? rand(8, 15) * speedK : -rand(4, 9) * speedK,
          swayAmp: feather ? rand(18, 34) : rand(6, 14),
          swaySpeed: feather ? rand(0.3, 0.5) : rand(0.25, 0.45),
          rot: feather ? rand(-0.7, 0.7) : rand(-0.3, 0.3),
          spin: 0,
          rotAmp: feather ? rand(0.4, 0.6) : rand(0.15, 0.25), // нахил «у такт» гойдання
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: feather ? 1.25 : 1.1,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  // ---------- Паперові літачки — сторінка консультацій для підлітків ----------
  // [верхнє крило, нижнє крило, кіль, контур]; світла тема — кольоровий папір, темна — білий
  const PLANE_TONES_LIGHT = [
    ['#d4e8fa', '#b3d3f2', '#8db8e3', '#6f9fd0'],   // небесний
    ['#d2f2ea', '#ade3d6', '#86cfbe', '#5fb7a3'],   // м'ятний
    ['#fde3d2', '#f8c8ac', '#efaa85', '#d98a63'],   // персиковий
    ['#e6dcf7', '#d0c0ef', '#b5a0e2', '#9680cc'],   // бузковий
  ];
  const PLANE_TONES_DARK = [
    ['#ffffff', '#e4eef9', '#c6daf0', '#a9c6e8'],
    ['#ffffff', '#e2f5ef', '#c2e8dd', '#9fd8c8'],
    ['#ffffff', '#fbece2', '#f2d4c2', '#e8bba1'],
    ['#ffffff', '#efe9fa', '#ddd2f3', '#c6b6ea'],
  ];
  // Літачок «носом» вправо, вигляд трохи збоку: верхнє крило, нижнє крило й кіль
  const makePlane = (tone) => makeSprite((g, P) => {
    const [top, low, keel, line] = tone;
    const N = [0.42 * P, 0], A = [-0.4 * P, -0.24 * P], F = [-0.16 * P, 0.04 * P];
    const B = [-0.36 * P, 0.22 * P], K = [-0.22 * P, 0.12 * P];
    const tri = (p1, p2, p3, fill) => {
      g.beginPath(); g.moveTo(...p1); g.lineTo(...p2); g.lineTo(...p3); g.closePath();
      g.fillStyle = fill; g.fill();
      g.strokeStyle = line; g.lineWidth = P * 0.014; g.lineJoin = 'round'; g.stroke();
    };
    tri(N, F, B, low);
    tri(N, F, K, keel);
    tri(N, A, F, top);
    // лінія згину на верхньому крилі
    g.strokeStyle = 'rgba(255,255,255,0.7)';
    g.lineWidth = P * 0.01;
    g.beginPath(); g.moveTo(N[0] * 0.9, 0); g.lineTo(-0.28 * P, -0.1 * P); g.stroke();
  });
  const PLANE_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [10, 14], alpha: [0.55, 0.68] },
    { depth: 0.12, share: 0.33, size: [14, 19], alpha: [0.64, 0.78] },
    { depth: 0.22, share: 0.17, size: [19, 25], alpha: [0.72, 0.88] },
  ];

  // Літачки летять носом уперед — праворуч і трохи вгору, легко «планеруючи»
  function buildPlanes() {
    const total = Math.min(40, Math.round((w * h) / 26000));
    items = [];
    PLANE_LAYERS.forEach((layer) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const tone = (Math.random() * PLANE_TONES_LIGHT.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        const heading = rand(-0.6, 0.15);          // кут польоту: переважно вгору-вправо
        const v = rand(14, 24) * speedK;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: cached('planeL' + tone, () => makePlane(PLANE_TONES_LIGHT[tone])),
          spriteDark: cached('planeD' + tone, () => makePlane(PLANE_TONES_DARK[tone])),
          glow: null,
          vx: Math.cos(heading) * v,
          vy: Math.sin(heading) * v,
          swayAmp: rand(2, 6),
          swaySpeed: rand(0.4, 0.8),
          rot: heading,
          spin: 0,
          rotAmp: rand(0.06, 0.12),               // легке погойдування на «повітряних хвилях»
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: 1.1,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  // ---------- Веселкові смужки-конфеті — сторінка підтримки LGBT людей ----------
  const STRIP_COLORS_LIGHT = ['#e46b6b', '#f29d4b', '#ecc33f', '#5fbf7c', '#4f9fe0', '#9b7fd4'];
  const STRIP_COLORS_DARK  = ['#ff9d9d', '#ffc488', '#ffe27e', '#93e1a9', '#8ec9f6', '#c7b1f2'];
  // Смужка лежить уздовж осі x — тоді «перевертання» (стиснення по x) виглядає як кружляння конфеті
  const makeStrip = (color) => makeSprite((g, P) => {
    const L = P * 0.6, W = P * 0.13;
    g.fillStyle = color;
    g.beginPath();
    g.roundRect ? g.roundRect(-L / 2, -W / 2, L, W, W / 2) : g.rect(-L / 2, -W / 2, L, W);
    g.fill();
    // світла смужка-відблиск уздовж
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(-L / 2 + W * 0.5, -W / 2 + W * 0.18, L - W, W * 0.22);
  });
  const STRIP_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [6, 8],   alpha: [0.5, 0.65] },
    { depth: 0.12, share: 0.33, size: [8, 11],  alpha: [0.6, 0.75] },
    { depth: 0.22, share: 0.17, size: [11, 15], alpha: [0.7, 0.88] },
  ];

  function buildStrips() {
    // елементи крихітні — їх більше, щоб фон «жив»
    const total = Math.min(110, Math.round((w * h) / 10000));
    items = [];
    STRIP_LAYERS.forEach((layer) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const c = (Math.random() * STRIP_COLORS_LIGHT.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: cached('stripL' + c, () => makeStrip(STRIP_COLORS_LIGHT[c])),
          spriteDark: cached('stripD' + c, () => makeStrip(STRIP_COLORS_DARK[c])),
          glow: null,
          vx: rand(-3, 3) * speedK,
          vy: rand(8, 16) * speedK,
          swayAmp: rand(8, 20),
          swaySpeed: rand(0.3, 0.6),
          rot: rand(0, Math.PI * 2),
          spin: rand(-1.0, 1.0),
          rotAmp: 0,
          flip: true,
          flipSpeed: rand(0.8, 1.6),
          pulse: false,
          darkBoost: 1,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  // ---------- Студентські капелюхи — сторінка профорієнтації «Фокус» ----------
  // [верх дошки, торець дошки, шапочка, китиця]
  const CAP_TONES_LIGHT = [
    ['#3a4659', '#253041', '#2e3a4c', '#d9a93f'],   // темно-синій із золотом
    ['#2f5a55', '#1f3f3b', '#284d48', '#d9a93f'],   // глибокий зелений (у тон сайту)
  ];
  const CAP_TONES_DARK = [
    ['#d7dfeb', '#a9b6c9', '#b9c5d6', '#f0cc72'],
    ['#cfe9e3', '#9cc8bd', '#addacf', '#f0cc72'],
  ];
  const makeCap = (tone) => makeSprite((g, P) => {
    const [top, side, cap, tassel] = tone;
    // шапочка під дошкою
    g.fillStyle = cap;
    g.beginPath();
    g.moveTo(-0.21 * P, 0.02 * P);
    g.lineTo(0.21 * P, 0.02 * P);
    g.lineTo(0.18 * P, 0.19 * P);
    g.quadraticCurveTo(0, 0.25 * P, -0.18 * P, 0.19 * P);
    g.closePath();
    g.fill();
    // дошка: ромб (вигляд трохи згори) з товщиною
    const board = (dy) => {
      g.beginPath();
      g.moveTo(-0.44 * P, -0.03 * P + dy);
      g.lineTo(0, -0.21 * P + dy);
      g.lineTo(0.44 * P, -0.03 * P + dy);
      g.lineTo(0, 0.13 * P + dy);
      g.closePath();
    };
    g.fillStyle = side;
    board(0.035 * P);
    g.fill();
    const grad = g.createLinearGradient(-0.4 * P, -0.2 * P, 0.4 * P, 0.1 * P);
    grad.addColorStop(0, top);
    grad.addColorStop(1, side);
    g.fillStyle = grad;
    board(0);
    g.fill();
    // китиця: від ґудзика до краю дошки й униз
    g.strokeStyle = tassel;
    g.lineWidth = P * 0.018;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, -0.04 * P);
    g.quadraticCurveTo(0.2 * P, -0.06 * P, 0.31 * P, -0.0 * P);
    g.lineTo(0.31 * P, 0.2 * P);
    g.stroke();
    g.fillStyle = tassel;
    g.beginPath();
    g.ellipse(0, -0.04 * P, 0.03 * P, 0.02 * P, 0, 0, Math.PI * 2); // ґудзик
    g.fill();
    g.beginPath();                                                   // пензлик китиці
    g.moveTo(0.29 * P, 0.19 * P);
    g.lineTo(0.33 * P, 0.19 * P);
    g.lineTo(0.35 * P, 0.31 * P);
    g.lineTo(0.27 * P, 0.31 * P);
    g.closePath();
    g.fill();
  });
  const CAP_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [14, 19], alpha: [0.42, 0.55] },
    { depth: 0.12, share: 0.33, size: [19, 25], alpha: [0.52, 0.66] },
    { depth: 0.22, share: 0.17, size: [25, 32], alpha: [0.6, 0.76] },
  ];

  // Капелюхи повільно злітають угору й погойдуються — як підкинуті на випускному
  function buildCaps() {
    const total = Math.min(40, Math.round((w * h) / 26000));
    items = [];
    CAP_LAYERS.forEach((layer) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const tone = (Math.random() * CAP_TONES_LIGHT.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: cached('capL' + tone, () => makeCap(CAP_TONES_LIGHT[tone])),
          spriteDark: cached('capD' + tone, () => makeCap(CAP_TONES_DARK[tone])),
          glow: null,
          vx: rand(-3, 3) * speedK,
          vy: -rand(6, 12) * speedK,
          swayAmp: rand(6, 14),
          swaySpeed: rand(0.25, 0.45),
          rot: rand(-0.25, 0.25),
          spin: 0,                                // чому: боком капелюх уже не впізнати — лише погойдуємо
          rotAmp: rand(0.18, 0.32),
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: 1.1,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  // ---------- Книжки й лампочки — сторінка «Дім психолога» ----------
  const BOOK_COLORS_LIGHT = ['#2f8f7c', '#c4973c', '#3c5a80', '#b8655a'];
  const BOOK_COLORS_DARK  = ['#6fd3bd', '#ebc56f', '#8eb1db', '#e79a8d'];
  // Закрита книжка: обкладинка з корінцем, видно зріз сторінок і закладку
  const makeBook = (color, dark) => makeSprite((g, P) => {
    const paper = dark ? '#fbf6ea' : '#f4ecd9';
    // блок сторінок (виглядає праворуч і знизу)
    g.fillStyle = paper;
    g.fillRect(-0.2 * P, -0.29 * P, 0.44 * P, 0.61 * P);
    g.strokeStyle = 'rgba(150,130,100,0.45)';
    g.lineWidth = P * 0.008;
    for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.moveTo(0.18 * P + i * 0.012 * P, -0.27 * P); g.lineTo(0.18 * P + i * 0.012 * P, 0.3 * P); g.stroke();
    }
    // обкладинка
    g.fillStyle = color;
    g.beginPath();
    g.roundRect ? g.roundRect(-0.25 * P, -0.33 * P, 0.43 * P, 0.62 * P, P * 0.03) : g.rect(-0.25 * P, -0.33 * P, 0.43 * P, 0.62 * P);
    g.fill();
    // корінець — темніша смуга
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(-0.25 * P, -0.33 * P, 0.07 * P, 0.62 * P);
    // «назва» на обкладинці
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(-0.12 * P, -0.2 * P, 0.22 * P, 0.035 * P);
    g.fillRect(-0.09 * P, -0.13 * P, 0.16 * P, 0.025 * P);
    // закладка-стрічка
    g.fillStyle = dark ? '#ffd36b' : '#d9a93f';
    g.beginPath();
    g.moveTo(0.08 * P, 0.28 * P); g.lineTo(0.13 * P, 0.28 * P); g.lineTo(0.13 * P, 0.4 * P);
    g.lineTo(0.105 * P, 0.37 * P); g.lineTo(0.08 * P, 0.4 * P); g.closePath();
    g.fill();
  });

  // Лампочка: скляна колба з ниткою розжарення і цоколь із різьбою
  const makeBulb = (dark) => makeSprite((g, P) => {
    const cy = -0.1 * P, r = 0.22 * P;
    g.beginPath();
    g.arc(0, cy, r, Math.PI * 0.75, Math.PI * 2.25);
    g.lineTo(0.09 * P, 0.16 * P);
    g.lineTo(-0.09 * P, 0.16 * P);
    g.closePath();
    const glass = g.createRadialGradient(-0.06 * P, cy - 0.06 * P, 0, 0, cy, r * 1.2);
    glass.addColorStop(0, dark ? '#fffbe8' : '#fffdf2');
    glass.addColorStop(1, dark ? '#ffd56e' : '#ffe9a8');
    g.fillStyle = glass;
    g.fill();
    g.strokeStyle = dark ? '#ffe39a' : '#d2a94e';
    g.lineWidth = P * 0.016;
    g.stroke();
    // нитка розжарення
    g.strokeStyle = dark ? '#f2a530' : '#c98a1e';
    g.lineWidth = P * 0.014;
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(-0.05 * P, 0.12 * P); g.lineTo(-0.05 * P, -0.04 * P);
    g.lineTo(-0.025 * P, -0.09 * P); g.lineTo(0, -0.04 * P); g.lineTo(0.025 * P, -0.09 * P);
    g.lineTo(0.05 * P, -0.04 * P); g.lineTo(0.05 * P, 0.12 * P);
    g.stroke();
    // цоколь
    g.fillStyle = dark ? '#c9d0d8' : '#8f99a4';
    g.fillRect(-0.09 * P, 0.16 * P, 0.18 * P, 0.12 * P);
    g.strokeStyle = dark ? '#9aa4ae' : '#6c7682';
    g.lineWidth = P * 0.012;
    for (const y of [0.2, 0.24]) { g.beginPath(); g.moveTo(-0.09 * P, y * P); g.lineTo(0.09 * P, y * P); g.stroke(); }
    g.fillStyle = dark ? '#9aa4ae' : '#5f6873';
    g.beginPath();
    g.moveTo(-0.05 * P, 0.28 * P); g.lineTo(0.05 * P, 0.28 * P); g.lineTo(0.025 * P, 0.32 * P); g.lineTo(-0.025 * P, 0.32 * P);
    g.closePath(); g.fill();
  });
  const makeIdeaGlow = () => makeSprite((g, P) => {
    const grad = g.createRadialGradient(0, -0.1 * P, 0, 0, -0.1 * P, P / 2);
    grad.addColorStop(0, 'rgba(255,214,110,0.6)');
    grad.addColorStop(0.4, 'rgba(255,200,90,0.18)');
    grad.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = grad;
    g.fillRect(-P / 2, -P / 2, P, P);
  });
  const BOOK_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [14, 19], alpha: [0.42, 0.55] },
    { depth: 0.12, share: 0.33, size: [19, 25], alpha: [0.52, 0.66] },
    { depth: 0.22, share: 0.17, size: [25, 32], alpha: [0.6, 0.76] },
  ];
  const BULB_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [13, 17], alpha: [0.55, 0.68] },
    { depth: 0.12, share: 0.33, size: [17, 22], alpha: [0.64, 0.78] },
    { depth: 0.22, share: 0.17, size: [22, 28], alpha: [0.72, 0.88] },
  ];

  // Книжки повільно пливуть і погойдуються; лампочки-ідеї злітають угору
  function buildStudy() {
    const total = Math.min(40, Math.round((w * h) / 26000));
    items = [];
    BOOK_LAYERS.forEach((_, li) => {
      const n = Math.max(1, Math.round(total * BOOK_LAYERS[li].share));
      for (let i = 0; i < n; i++) {
        const book = Math.random() < 0.55;
        const layer = (book ? BOOK_LAYERS : BULB_LAYERS)[li];
        const c = (Math.random() * BOOK_COLORS_LIGHT.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        const dir = rand(0, Math.PI * 2);
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: book ? cached('bookL' + c, () => makeBook(BOOK_COLORS_LIGHT[c], false))
                       : cached('bulbL', () => makeBulb(false)),
          spriteDark: book ? cached('bookD' + c, () => makeBook(BOOK_COLORS_DARK[c], true))
                           : cached('bulbD', () => makeBulb(true)),
          glow: book ? null : cached('ideaGlow', makeIdeaGlow), // у темній темі лампочки світяться
          vx: book ? Math.cos(dir) * rand(3, 6) * speedK : rand(-2, 2) * speedK,
          vy: book ? Math.sin(dir) * rand(3, 6) * speedK : -rand(5, 10) * speedK,
          swayAmp: rand(4, 10),
          swaySpeed: rand(0.25, 0.45),
          rot: rand(-0.3, 0.3),
          spin: 0,
          rotAmp: book ? rand(0.15, 0.3) : rand(0.08, 0.16),
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: book ? 1.35 : 1.1,          // кольорові обкладинки на темному «тьмяніють»
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.4, 0.8),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  const PETAL_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [12, 18], alpha: [0.4, 0.55] },
    { depth: 0.12, share: 0.33, size: [18, 26], alpha: [0.5, 0.65] },
    { depth: 0.22, share: 0.17, size: [26, 36], alpha: [0.6, 0.78] },
  ];
  const HEART_LAYERS = [
    { depth: 0.05, share: 0.5,  size: [8, 13],  alpha: [0.35, 0.5] },
    { depth: 0.12, share: 0.33, size: [13, 19], alpha: [0.45, 0.65] },
    { depth: 0.22, share: 0.17, size: [19, 27], alpha: [0.6, 0.82] },
  ];

  // kind: 'petals' | 'hearts' | 'romance' (пелюстки й сердечка разом) | 'puzzle'
  function buildFloaters(kind) {
    if (kind === 'puzzle') { buildPuzzle(); return; }
    if (kind === 'airy') { buildAiry(); return; }
    if (kind === 'pairs') { buildPairs(); return; }
    if (kind === 'planes') { buildPlanes(); return; }
    if (kind === 'strips') { buildStrips(); return; }
    if (kind === 'caps') { buildCaps(); return; }
    if (kind === 'study') { buildStudy(); return; }
    const total = Math.min(kind === 'romance' ? 60 : 55, Math.round((w * h) / (kind === 'romance' ? 22000 : 24000)));
    items = [];
    PETAL_LAYERS.forEach((_, li) => {
      const n = Math.max(1, Math.round(total * PETAL_LAYERS[li].share));
      for (let i = 0; i < n; i++) {
        const petals = kind === 'petals' || (kind === 'romance' && Math.random() < 0.55);
        const layer = (petals ? PETAL_LAYERS : HEART_LAYERS)[li];
        const glow = petals ? null : cached('warmGlow', makeWarmGlow);
        const tone = (Math.random() * 3) | 0;
        const speedK = 0.6 + layer.depth * 3; // ближчі шари рухаються швидше
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: petals ? cached('petal' + tone, () => makePetal(PETAL_TONES[tone]))
                         : cached('heart' + tone, () => makeHeart(HEART_TONES[tone])),
          glow,
          // пелюстки повільно опадають, сердечка спливають угору
          vx: rand(-5, 5) * speedK,
          vy: (petals ? rand(10, 22) : -rand(5, 12)) * speedK,
          swayAmp: petals ? rand(12, 30) : rand(6, 14),
          swaySpeed: rand(0.25, 0.55),
          rot: rand(0, Math.PI * 2) * (petals ? 1 : 0.1),
          spin: petals ? rand(-0.5, 0.5) : 0,
          rotAmp: petals ? 0 : rand(0.12, 0.25),   // сердечко лише погойдується
          flip: petals,                            // пелюстка «перевертається» в повітрі
          flipSpeed: rand(0.4, 0.9),
          pulse: !petals,                          // сердечко ледь «б'ється»
          darkBoost: petals ? 1.35 : 1,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  // Пазли повільно дрейфують у різні боки й ледь обертаються — спокійно, «по-діловому»
  function buildPuzzle() {
    const total = Math.min(50, Math.round((w * h) / 26000));
    items = [];
    PUZZLE_LAYERS.forEach((layer) => {
      const n = Math.max(1, Math.round(total * layer.share));
      for (let i = 0; i < n; i++) {
        const shape = (Math.random() * PUZZLE_SHAPES.length) | 0;
        const tone = (Math.random() * PUZZLE_TONES.length) | 0;
        const speedK = 0.6 + layer.depth * 3;
        const dir = rand(0, Math.PI * 2);
        const v = rand(3, 8) * speedK;
        items.push({
          depth: layer.depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          sprite: cached(`puzzle${shape}-${tone}`, () => makePuzzle(shape, PUZZLE_TONES[tone])),
          glow: null,
          vx: Math.cos(dir) * v,
          vy: Math.sin(dir) * v,
          swayAmp: rand(4, 10),
          swaySpeed: rand(0.2, 0.4),
          rot: rand(0, Math.PI * 2),
          spin: rand(-0.12, 0.12),
          rotAmp: 0,
          flip: false,
          flipSpeed: 0,
          pulse: false,
          darkBoost: 1.3,
          born: rand(0, 7),
          fade: rand(2.5, 5),
          speed: rand(0.5, 1.0),
          phase: rand(0, Math.PI * 2),
        });
      }
    });
  }

  function drawFloaters(t, still) {
    const tt = still ? 0 : t;
    for (const it of items) {
      const ease = appearOf(it, t, still);
      if (ease <= 0) continue;
      const ox = still ? 0 : smoothMX * it.depth * 60;
      const oy = still ? 0 : -smoothScroll * it.depth + smoothMY * it.depth * 40;
      const pad = it.size * 2;
      const sway = Math.sin(tt * it.swaySpeed + it.phase);
      const x = wrap(it.x + it.vx * tt + sway * it.swayAmp + ox, w, pad);
      const y = wrap(it.y + it.vy * tt + oy, h, pad);
      const rot = it.rot + it.spin * tt + sway * it.rotAmp;
      const pulse = still ? 1 : 0.5 + 0.5 * Math.sin(tt * it.speed + it.phase);
      const sx = it.flip && !still ? 0.3 + 0.7 * Math.abs(Math.cos(tt * it.flipSpeed + it.phase)) : 1;
      const k = it.pulse ? 1 + 0.06 * pulse : 1;
      const ds = it.size / 0.85;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      if (it.glow && isDark()) { // чому: на білому тепле сяйво дає рожеву «каламуть»
        const gs = it.size * 2.6;
        ctx.globalAlpha = ease * it.a * (0.25 + 0.25 * pulse);
        ctx.drawImage(it.glow, -gs / 2, -gs / 2, gs, gs);
      }
      ctx.scale(sx * k, k);
      // чому: на темному фоні напівпрозора пелюстка «сіріє» — робимо її щільнішою
      // чому: на темному фоні напівпрозора пелюстка «сіріє» — робимо її щільнішою
      ctx.globalAlpha = Math.min(1, it.a * (isDark() ? it.darkBoost : 1)) * ease;
      ctx.drawImage(isDark() && it.spriteDark ? it.spriteDark : it.sprite, -ds / 2, -ds / 2, ds, ds);
      ctx.restore();
    }
  }

  // Які мотиви на якій сторінці: [світла тема, темна тема]
  const bodyCls = document.body.classList;
  const PAGE_MODES =
    bodyCls.contains('page-sexology')  ? { light: 'romance', dark: 'romance' } :
    bodyCls.contains('page-trainings') ? { light: 'puzzle',  dark: 'puzzle' }  :
    bodyCls.contains('page-individual') ? { light: 'airy',   dark: 'airy' }    :
    bodyCls.contains('page-family')     ? { light: 'pairs',  dark: 'pairs' }   :
    bodyCls.contains('page-teens')      ? { light: 'planes', dark: 'planes' }  :
    bodyCls.contains('page-lgbt')       ? { light: 'strips', dark: 'strips' }  :
    bodyCls.contains('page-focus')      ? { light: 'caps',   dark: 'caps' }    :
    bodyCls.contains('page-psy-home')   ? { light: 'study',  dark: 'study' }   :
                                         { light: 'clover',  dark: 'stars' };
  const modeFor = () => (isDark() ? PAGE_MODES.dark : PAGE_MODES.light);

  const build = () => {
    if (mode === 'stars') buildStars();
    else if (mode === 'clover') buildClovers();
    else buildFloaters(mode);
  };

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
    measureHero();
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

  // Згладжування, незалежне від частоти кадрів (dt — мс від попереднього кадру)
  const ease = (k, dt) => 1 - Math.pow(1 - k, dt / 16.7);

  function draw(now, dt = 16.7) {
    const t = (now - startTime) / 1000;
    const still = reduceMotion.matches;
    if (!still) {
      smoothScroll += (scrollY - smoothScroll) * ease(0.08, dt);
      smoothMX += (mouseX - smoothMX) * ease(0.04, dt);
      smoothMY += (mouseY - smoothMY) * ease(0.04, dt);
    }
    ctx.clearRect(0, 0, w, h);
    if (mode === 'stars') drawStars(t, still);
    else if (mode === 'clover') drawClovers(t, still);
    else drawFloaters(t, still);
    ctx.globalAlpha = 1;
  }

  // ---------- Економія ресурсів ----------
  // 1) ~30 кадрів/с: рух дуже повільний, на око різниці з 60 немає, а навантаження вдвічі менше.
  // 2) Поки перший екран (шапка з фото) повністю закриває фон — не малюємо зовсім:
  //    саме під час завантаження сторінки процесор лишається вільним.
  const FRAME_MS = 1000 / 30 - 2;
  const hero = document.querySelector('.hero');
  let heroBottom = 0, lastFrame = 0, revealed = false;
  const measureHero = () => {
    heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;
  };
  const coveredByHero = () => window.scrollY + window.innerHeight <= heroBottom;

  function loop(now) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (now - lastFrame < FRAME_MS) return;
    const dt = lastFrame ? Math.min(100, now - lastFrame) : 16.7;
    lastFrame = now;
    if (coveredByHero()) {
      smoothScroll = scrollY;               // щоб після повернення не було «ривка» паралаксу
      if (!revealed) startTime = now;       // елементи почнуть проявлятися, коли фон стане видно
      return;
    }
    revealed = true;
    draw(now, dt);
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
    const next = modeFor();
    if (next === mode) return;
    clearTimeout(switchTimer);
    if (!canvas || !mode) { show(next); return; }
    // плавно гасимо поточний фон, тоді проявляємо новий
    canvas.classList.remove('is-on');
    switchTimer = setTimeout(() => show(modeFor()), 700);
  }

  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', () => canvas && resize());
  window.addEventListener('load', measureHero); // після завантаження картинок висота шапки точна
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  reduceMotion.addEventListener?.('change', () => mode && show(mode));

  sync();
})();
