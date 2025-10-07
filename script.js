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
        { threshold: 0.2 }
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

        lightboxImg.src = img.getAttribute('data-large') || img.getAttribute('src') || '';
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


