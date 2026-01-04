document.addEventListener("DOMContentLoaded", () => {
  /* ===== Mobilmeny ===== */
  const toggle = document.getElementById("mobile-menu");
  const links = document.getElementById("navbar-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("active");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ===== Header: exakt som screenshot (transparent -> svart transparent vid scroll) ===== */
  const header = document.getElementById("siteHeader");
  const SCROLL_THRESHOLD = 10;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ===== Mini-slider per card ===== */
  const cards = Array.from(document.querySelectorAll(".card"));

  cards.forEach((card) => {
    const images = (card.dataset.images || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (!images.length) return;

    const imgEl = card.querySelector(".card-img");
    const prevBtn = card.querySelector(".card-nav.prev");
    const nextBtn = card.querySelector(".card-nav.next");
    const dotsWrap = card.querySelector(".card-dots");

    let idx = 0;
    card.dataset.index = "0";

    const dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      images.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          goTo(i);
        });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function update() {
      card.dataset.index = String(idx);
      if (imgEl) imgEl.src = images[idx];

      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));

      const multi = images.length > 1;
      if (prevBtn) prevBtn.style.display = multi ? "" : "none";
      if (nextBtn) nextBtn.style.display = multi ? "" : "none";
      if (dotsWrap) dotsWrap.style.display = multi ? "" : "none";
    }

    function goTo(i) {
      idx = (i + images.length) % images.length;
      update();
    }
    function next() { goTo(idx + 1); }
    function prev() { goTo(idx - 1); }

    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); next(); });
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prev(); });

    // swipe på card-bilden
    if (imgEl) {
      let startX = null;
      imgEl.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      imgEl.addEventListener("touchend", (e) => {
        if (startX == null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        startX = null;
      }, { passive: true });
    }

    update();
  });

  /* ===== Lightbox ===== */
  const lb = document.getElementById("lightbox");
  if (!lb) return;

  const lbImg = lb.querySelector(".lb-img");
  const btnPrev = lb.querySelector(".lb-nav.prev");
  const btnNext = lb.querySelector(".lb-nav.next");
  const btnClose = lb.querySelector(".lb-close");

  let gallery = [];
  let index = 0;

  function updateLB() {
    if (!lbImg || !gallery.length) return;
    lbImg.src = gallery[index];
    lbImg.alt = "";
  }

  function openLB(imgs, startIndex = 0) {
    gallery = imgs;
    index = Math.max(0, Math.min(startIndex, imgs.length - 1));
    updateLB();
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLB() {
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    gallery = [];
    index = 0;
  }

  function nextLB() {
    if (!gallery.length) return;
    index = (index + 1) % gallery.length;
    updateLB();
  }

  function prevLB() {
    if (!gallery.length) return;
    index = (index - 1 + gallery.length) % gallery.length;
    updateLB();
  }

  // öppna från card (starta på vald mini-slide)
  cards.forEach((card) => {
    const imgs = (card.dataset.images || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (!imgs.length) return;

    const openBtn = card.querySelector(".card-link");
    const startIndex = () => Number(card.dataset.index || "0") || 0;

    if (openBtn) openBtn.addEventListener("click", () => openLB(imgs, startIndex()));
  });

  if (btnClose) btnClose.addEventListener("click", closeLB);
  if (btnNext) btnNext.addEventListener("click", nextLB);
  if (btnPrev) btnPrev.addEventListener("click", prevLB);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });

  document.addEventListener("keydown", (e) => {
    if (lb.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") nextLB();
    if (e.key === "ArrowLeft") prevLB();
  });

  // swipe i lightbox
  if (lbImg) {
    let startX = null;
    lbImg.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    lbImg.addEventListener("touchend", (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? nextLB : prevLB)();
      startX = null;
    }, { passive: true });
  }
});
/* --- NYTT SCRIPT FÖR PILARNA --- */
  const navArrows = document.querySelectorAll('.nav-arrow');

  navArrows.forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      // Hitta kortet som pilen tillhör
      const card = arrow.closest('.project-card');
      // Hitta bildslidern inuti just det kortet
      const slider = card.querySelector('.image-slider');
      
      // Räkna ut hur brett kortet är just nu (så vi vet hur långt vi ska scrolla)
      const scrollAmount = slider.offsetWidth;

      if (arrow.classList.contains('next-arrow')) {
        // Scrolla höger (nästa)
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        // Scrolla vänster (föregående)
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });
  });