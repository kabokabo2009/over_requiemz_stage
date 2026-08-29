(function () {
  "use strict";

  const castData = {
    "01": { photo: "images/cast-01.jpg", name: "丸山 龍星", role: "カイゼ・オズマ 役" },
    "02": { photo: "images/cast-02.jpg", name: "平賀 勇成", role: "クロードグレイン 役" },
    "03": { photo: "images/cast-03.jpg", name: "天野 旭陽", role: "モリィ・ウッドランド 役" },
    "04": { photo: "images/cast-04.jpg", name: "木村 優良", role: "ノイル・ベスティア 役" },
    "05": { photo: "images/cast-05.jpg", name: "大隈 勇太", role: "ドロシー 役" },
    "06": { photo: "images/cast-06.jpg", name: "朝倉 ふゆな", role: "ユヒル 役" },
    "07": { photo: "images/cast-07.jpg", name: "佐藤 たかみち", role: "アクレイ 役" },
    "08": { photo: "images/cast-08.jpg", name: "高岡 薫", role: "ネノス・ウラウ 役" },
    "09": { photo: "images/cast-09.jpg", name: "柳堀 花怜", role: "グリンダ・フェリス 役" },
    "10": { photo: "images/cast-10.jpg", name: "馬場 良馬", role: "オッサーウッドランド 役" }
  };

  const castKeys = Object.keys(castData);
  const body = document.body;

  const loading = document.getElementById("loading");
  const loadingBar = loading ? loading.querySelector(".loadingBar i") : null;
  const firstVisit = (function () {
    try {
      return !localStorage.getItem("orq-stage-visited");
    } catch (error) {
      return true;
    }
  })();
  let rate = 0;
  let rateTimer = null;
  let loadingDone = false;

  function countUp() {
    rate = Math.min(92, rate + Math.random() * 16 + 6);
    if (loadingBar) loadingBar.style.width = rate + "%";
  }

  function hideLoading() {
    if (loadingDone) return;
    loadingDone = true;
    if (rateTimer) clearInterval(rateTimer);
    if (loadingBar) loadingBar.style.width = "100%";
    try {
      localStorage.setItem("orq-stage-visited", "1");
    } catch (error) {}
    body.classList.add("loaded");
    body.classList.remove("loading");
    setTimeout(function () {
      setTimeout(function () {
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
      }, 1300);
    }, 0);
  }

  function skipLoading() {
    loadingDone = true;
    body.classList.add("loaded");
    body.classList.remove("loading");
    if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
  }

  const mvImg = document.querySelector(".mvPoster");

  if (!firstVisit) {
    skipLoading();
  } else {
    rateTimer = setInterval(countUp, 180);
    if (mvImg && !mvImg.complete) {
      mvImg.addEventListener("load", hideLoading, { once: true });
      mvImg.addEventListener("error", hideLoading, { once: true });
    } else {
      window.addEventListener("load", hideLoading, { once: true });
    }
    setTimeout(hideLoading, 4200);
  }

  const header = document.getElementById("header");
  const mv = document.getElementById("mv");
  const washes = document.querySelectorAll(".washLayer");
  const mvInner = document.querySelector(".mvInner");
  const mvTtl = document.querySelector(".mvPoster");
  const mvHaze = document.querySelector(".mvHaze");
  const particleCanvas = document.querySelector(".mvParticles");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scrolling = false;

  function onScroll() {
    const top = window.pageYOffset;

    if (header) header.classList.toggle("fixed", top > 60);

    if (!calm && mv && top < mv.offsetHeight + 120) {
      const span = mv.offsetHeight;
      const gone = Math.min(1, Math.max(0, top - span * 0.06) / (span * 0.6));
      const veil = Math.min(1, Math.max(0, top - span * 0.24) / (span * 0.7));

      if (mvInner) {
        mvInner.style.transform = "translate3d(0,-" + (top * 0.26).toFixed(1) + "px,0)";
        mvInner.style.opacity = (1 - gone).toFixed(3);
      }
      if (mvTtl) mvTtl.style.transform = "translate3d(0,-" + (top * 0.13).toFixed(1) + "px,0)";
      if (mvHaze) mvHaze.style.opacity = (veil * 0.55).toFixed(3);
    }

    if (!calm) {
      const view = window.innerHeight;
      washes.forEach(function (layer) {
        const box = layer.getBoundingClientRect();
        if (box.bottom < -240 || box.top > view + 240) return;
        const ratio = (box.top + box.height / 2 - view / 2) / (view + box.height);
        layer.style.transform = "translate3d(-50%," + (ratio * -150).toFixed(1) + "px,0)";
      });
    }

    scrolling = false;
  }

  window.addEventListener("scroll", function () {
    if (scrolling) return;
    scrolling = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();

  function startParticles() {
    if (!particleCanvas || calm || !window.requestAnimationFrame) return;
    const context = particleCanvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let running = true;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = particleCanvas.clientWidth;
      height = particleCanvas.clientHeight;
      particleCanvas.width = Math.floor(width * ratio);
      particleCanvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const amount = width < 768 ? 18 : 34;
      particles = Array.from({ length: amount }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.3 + 0.5,
          speed: Math.random() * 0.35 + 0.22,
          drift: (Math.random() - 0.5) * 0.36,
          phase: Math.random() * Math.PI * 2,
          tone: Math.random() > 0.7 ? "124, 237, 217" : "215, 242, 255"
        };
      });
    }

    function draw() {
      if (!running) return;
      context.clearRect(0, 0, width, height);
      particles.forEach(function (particle) {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        particle.phase += 0.025;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;

        const alpha = 0.28 + (Math.sin(particle.phase) + 1) *0.3;
        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 5);
        glow.addColorStop(0, "rgba(" + particle.tone + "," + alpha + ")");
        glow.addColorStop(1, "rgba(" + particle.tone + ",0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
        context.fill();
      });
      frame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      running = document.visibilityState === "visible";
      if (running && !frame) frame = window.requestAnimationFrame(draw);
      if (!running && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    draw();
  }

  startParticles();

  let holdY = 0;

  function holdScroll() {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    holdY = window.pageYOffset;
    if (gap > 0) body.style.paddingRight = gap + "px";
    body.style.top = -holdY + "px";
    body.classList.add("scrollLock");
  }

  function releaseScroll() {
    const root = document.documentElement;
    const keep = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    body.classList.remove("scrollLock");
    body.style.removeProperty("top");
    body.style.removeProperty("padding-right");
    window.scrollTo(0, holdY);
    root.style.scrollBehavior = keep;
  }

  const btnMenu = document.getElementById("btnMenu");
  const gnav = document.getElementById("gnav");

  function closeMenu() {
    if (!gnav || !btnMenu) return;
    if (!gnav.classList.contains("open")) return;
    gnav.classList.remove("open");
    btnMenu.setAttribute("aria-expanded", "false");
    const label = btnMenu.querySelector("em");
    if (label) label.textContent = "メニュー";
    releaseScroll();
  }

  if (btnMenu && gnav) {
    btnMenu.addEventListener("click", function () {
      const opened = gnav.classList.toggle("open");
      btnMenu.setAttribute("aria-expanded", opened ? "true" : "false");
      const label = btnMenu.querySelector("em");
      if (label) label.textContent = opened ? "閉じる" : "メニュー";
      if (opened) {
        holdScroll();
      } else {
        releaseScroll();
      }
    });

    gnav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  const fades = document.querySelectorAll(".fadeUp");

  if ("IntersectionObserver" in window) {
    const watcher = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (!item.isIntersecting) return;
        item.target.classList.add("on");
        watcher.unobserve(item.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    fades.forEach(function (el) { watcher.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add("on"); });
  }

  document.querySelectorAll(".castPhoto img, .goodsBox img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("shown");
      return;
    }
    img.addEventListener("load", function () { img.classList.add("shown"); }, { once: true });
    img.addEventListener("error", function () { img.classList.add("shown"); }, { once: true });
  });

  const faqItems = document.querySelectorAll(".faqItem");

  faqItems.forEach(function (item) {
    const q = item.querySelector(".faqQ");
    if (!q) return;
    q.addEventListener("click", function () {
      const opened = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        const otherQ = other.querySelector(".faqQ");
        if (otherQ) otherQ.setAttribute("aria-expanded", "false");
      });
      if (opened) return;
      item.classList.add("open");
      q.setAttribute("aria-expanded", "true");
    });
  });

  const modal = document.getElementById("modal");
  const modalPhoto = document.getElementById("modalPhoto");
  const modalName = modal ? modal.querySelector(".modalName") : null;
  const modalRole = modal ? modal.querySelector(".modalRole") : null;
  let nowIndex = 0;
  let opener = null;

  function setCast(index) {
    nowIndex = (index + castKeys.length) % castKeys.length;
    const data = castData[castKeys[nowIndex]];
    if (!data) return;
    if (modalPhoto) {
      modalPhoto.src = data.photo;
      modalPhoto.alt = data.name + "（" + data.role + "）";
    }
    if (modalName) modalName.textContent = data.name;
    if (modalRole) modalRole.textContent = data.role;
  }

  function openModal(key, from) {
    if (!modal) return;
    const index = castKeys.indexOf(key);
    setCast(index < 0 ? 0 : index);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    holdScroll();
    opener = from || null;
    const close = modal.querySelector(".btnClose");
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    releaseScroll();
    if (opener) opener.focus();
  }

  document.querySelectorAll(".castBtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-cast"), btn);
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    modal.querySelectorAll("[data-move]").forEach(function (el) {
      el.addEventListener("click", function () {
        setCast(nowIndex + Number(el.getAttribute("data-move")));
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      closeMenu();
      return;
    }
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "ArrowRight") setCast(nowIndex + 1);
    if (e.key === "ArrowLeft") setCast(nowIndex - 1);
  });
})();
