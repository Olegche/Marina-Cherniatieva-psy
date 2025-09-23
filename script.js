// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
  // рік у футері
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    }, { threshold: .2 });
    reveals.forEach(el => observer.observe(el));
  }

  // кнопки запису
  const mainBtn = document.getElementById('main-btn');
  const altBtns = document.getElementById('alt-buttons');
  if (mainBtn && altBtns) {
    const fadeBtns = altBtns.querySelectorAll('.fade');
    mainBtn.addEventListener('click', e => {
      e.preventDefault();
      mainBtn.style.display = 'none';
      altBtns.style.display = 'flex';
      fadeBtns.forEach((btn, i) => setTimeout(() => btn.classList.add('show'), i * 950));
    });
  }

  // Ініціалізація Swiper — переконайтесь, що бібліотека підключена ПЕРЕД цим файлом
  let swiper;
  try {
    swiper = new Swiper('.swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }
    });
  } catch (e) {
    // Swiper не підключений — нічого страшного
    console.warn('Swiper init failed:', e);
  }

  // Lightbox
  const lightboxEl = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (lightboxEl && lightboxImg) {
    let closeBtn = lightboxEl.querySelector('.close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'close';
      closeBtn.innerHTML = '&times;';
      lightboxEl.appendChild(closeBtn);
    }

    function openLightbox(img) {
      lightboxEl.style.display = 'flex';
      lightboxEl.classList.add('open');
      lightboxImg.src = img.dataset.large || img.src;
      lightboxImg.alt = img.alt || '';
      document.body.style.overflow = 'hidden';
      if (swiper && swiper.autoplay && typeof swiper.autoplay.stop === 'function') {
        try { swiper.autoplay.stop(); } catch (e) {}
      }
    }

    function closeLightbox() {
      lightboxEl.style.display = 'none';
      lightboxEl.classList.remove('open');
      document.body.style.overflow = '';
      if (swiper && swiper.autoplay && typeof swiper.autoplay.start === 'function') {
        try { swiper.autoplay.start(); } catch (e) {}
      }
      lightboxImg.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl || e.target === lightboxImg) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    document.querySelectorAll('.cert-thumb').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        if (lightboxEl.style.display === 'flex') closeLightbox();
        else openLightbox(img);
      });
    });

    lightboxEl.style.display = 'none';
  }
});
// ...existing code...