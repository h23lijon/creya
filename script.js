// All JS körs först när DOM finns
document.addEventListener('DOMContentLoaded', () => {
  // === Mobilmeny ===
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navbar ul');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('active'));
  }

  // === Fullskärms-intro (om elementen finns) ===
  (function () {
    const OVERLAY_ID = 'introOverlay';
    const VIDEO_ID = 'introVideo';
    const SKIP_ID = 'skipBtn';
    const FLAG = 'introPlayedThisSession';

    const overlay = document.getElementById(OVERLAY_ID);
    const video = document.getElementById(VIDEO_ID);
    const skip = document.getElementById(SKIP_ID);

    if (!overlay || !video) return;

    const alreadyPlayed = sessionStorage.getItem(FLAG) === '1';

    function hideOverlay() {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }

    function markPlayed() {
      try { sessionStorage.setItem(FLAG, '1'); } catch (_) {}
    }

    if (!alreadyPlayed) {
      video.muted = true;
      video.play().catch(() => {});
      markPlayed();
    } else {
      hideOverlay();
    }

    video.addEventListener('ended', hideOverlay);
    if (skip) skip.addEventListener('click', hideOverlay);

    overlay.addEventListener('click', (e) => {
      if (e.target !== skip) hideOverlay();
    });

    function shouldDismissOn(el) {
      if (!el) return false;
      if (el.matches('input, textarea, select')) return true;
      if (el.isContentEditable) return true;
      return false;
    }

    document.addEventListener('focusin', (e) => {
      if (shouldDismissOn(e.target)) hideOverlay();
    });

    document.addEventListener('click', (e) => {
      if (shouldDismissOn(e.target)) hideOverlay();
    });
  })();

  // === Navbar på scroll (om hero/header finns) ===
  const hero = document.querySelector('.hero-section-ill') || document.querySelector('.hero-section');
  const header = document.querySelector('.site-header');
  const logo = document.querySelector('.header-logo');

  if (hero && header) {
    window.addEventListener('scroll', () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom <= 0) {
        header.classList.add('scrolled');
        header.classList.remove('hover-scrolled');
        if (logo) logo.src = 'img/creya6.svg';
      } else {
        header.classList.remove('scrolled');
        if (logo) logo.src = 'img/cre.svg';
      }
    });

    header.addEventListener('mouseenter', () => {
      if (!header.classList.contains('scrolled')) {
        header.classList.add('hover-scrolled');
        if (logo) logo.src = 'img/creya6.svg';
      }
    });

    header.addEventListener('mouseleave', () => {
      header.classList.remove('hover-scrolled');
      const heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom > 0 && logo) logo.src = 'img/cre.svg';
    });
  }

  // === Form-modaler (guards) ===
  const formModal = document.getElementById("formModal");
  const thankModal = document.getElementById("thankModal");
  const contactForm = document.getElementById("contactForm");

  function openFormModal() { if (formModal) formModal.style.display = "flex"; }
  function closeFormModal() { if (formModal) formModal.style.display = "none"; }
  function closeThankModal() { if (thankModal) thankModal.style.display = "none"; }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      closeFormModal();
      if (thankModal) thankModal.style.display = "flex";
    });
  }

  const openFormButton = document.getElementById("openFormButton");
  if (openFormButton) openFormButton.addEventListener("click", openFormModal);

  const resetForm = document.getElementById("resetForm");
  if (resetForm) {
    resetForm.addEventListener("click", () => {
      if (contactForm) contactForm.reset();
      const charCount = document.getElementById("charCount");
      if (charCount) charCount.textContent = "200 tecken kvar";
    });
  }

  const textarea = document.getElementById("meddelande");
  const charCount = document.getElementById("charCount");
  if (textarea && charCount) {
    textarea.addEventListener("input", () => {
      const remaining = 200 - textarea.value.length;
      charCount.textContent = `${remaining} tecken kvar`;
      charCount.style.color = remaining < 20 ? "#b30000" : "#666";
    });
  }

  // === (valfri) Mini-slider – lämnas oförändrad om du använder den på andra sidor ===
  (function initPortfolioSliders() {
    const sliders = document.querySelectorAll('.portfolio-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll('.portfolio-slide'));
      if (slides.length <= 1) return;

      const prevBtn = slider.querySelector('.portfolio-slider-btn.prev');
      const nextBtn = slider.querySelector('.portfolio-slider-btn.next');
      const dotsWrap = slider.querySelector('.portfolio-slider-dots');

      let index = slides.findIndex(s => s.classList.contains('active'));
      if (index === -1) index = 0;

      const dots = slides.map((_, i) => {
        const b = document.createElement('button');
        if (i === index) b.classList.add('is-active');
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
        return b;
      });

      function goTo(i) {
        slides[index].classList.remove('active');
        dots[index].classList.remove('is-active');
        index = (i + slides.length) % slides.length;
        slides[index].classList.add('active');
        dots[index].classList.add('is-active');
      }

      function next() { goTo(index + 1); }
      function prev() { goTo(index - 1); }

      if (nextBtn) nextBtn.addEventListener('click', next);
      if (prevBtn) prevBtn.addEventListener('click', prev);

      let timer = null;
      const autoplay = slider.dataset.autoplay === 'true';
      const interval = Number(slider.dataset.interval || 4000);

      function start() { if (!autoplay) return; stop(); timer = setInterval(next, interval); }
      function stop() { if (timer) clearInterval(timer); }

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('touchstart', stop, { passive: true });
      slider.addEventListener('touchend', start);

      start();
    });
  })();

  // === Lightbox för portfolio cards med flera bilder ===
  (function initLightboxGallery() {
    const lb = document.getElementById('lightbox');
    const cards = document.querySelectorAll('.card');
    if (!lb || !cards.length) return;

    const imgEl   = lb.querySelector('.lb-img');
    const btnPrev = lb.querySelector('.prev');
    const btnNext = lb.querySelector('.next');
    const btnClose= lb.querySelector('.lb-close');

    let gallery = [];
    let index = 0;

    function updateImg() {
      imgEl.src = gallery[index];
      imgEl.alt = '';
    }

    function openLB(imgs, start = 0) {
      gallery = imgs;
      index = start;
      updateImg();
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLB() {
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      gallery = [];
      index = 0;
    }

    function next() { if (gallery.length) { index = (index + 1) % gallery.length; updateImg(); } }
    function prev() { if (gallery.length) { index = (index - 1 + gallery.length) % gallery.length; updateImg(); } }

    // Koppla kort → öppna lightbox
    cards.forEach(card => {
      const btn = card.querySelector('.card-link');
      const imgNode = card.querySelector('img');
      const imgs = (card.dataset.images || "")
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (!imgs.length) return; // inget galleri definierat

      if (btn) btn.addEventListener('click', () => openLB(imgs, 0));
      if (imgNode) imgNode.addEventListener('click', () => openLB(imgs, 0));
    });

    // Navigation
    if (btnClose) btnClose.addEventListener('click', closeLB);
    if (btnNext)  btnNext.addEventListener('click', next);
    if (btnPrev)  btnPrev.addEventListener('click', prev);

    // Stäng när man klickar utanför bilden
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLB();
    });

    // Tangentbord
    document.addEventListener('keydown', (e) => {
      if (lb.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Enkel swipe
    let startX = null;
    imgEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, {passive:true});
    imgEl.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
      startX = null;
    }, {passive:true});
  })();
});
