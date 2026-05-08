const state = {
  theme: localStorage.getItem("portfolio-theme-v3") || "light",
  menuOpen: false,
};

const loader = document.getElementById("loader");
const loaderPercent = document.getElementById("loaderPercent");
const header = document.getElementById("header");
const progressBar = document.querySelector(".scroll-progress");
const navMenu = document.getElementById("navMenu");
const menuToggle = document.getElementById("menuToggle");
const themeToggle = document.getElementById("themeToggle");
const revealItems = document.querySelectorAll("[data-reveal]");
const skillItems = document.querySelectorAll(".skill-item");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("[data-section-root]");
const flowPanel = document.getElementById("flowPanel");
const copyEmail = document.getElementById("copyEmail");

const sliderData = [
  {
    title: "TRACE",
    description: "기록하고 다시 보며 원인을 좁히는 방식으로 배워왔습니다.",
    meta: "video review / feedback / debugging",
    color: "#18202d",
    image: "./assets/profile.jpg",
    codeTitle: "record.review()",
    codeBody: "match.video -> feedback -> adjust",
  },
  {
    title: "FLOW",
    description: "화면에서 시작된 요청이 서버와 데이터베이스를 지나 돌아오는 흐름을 봅니다.",
    meta: "screen / api / database",
    color: "#142335",
    codeTitle: "request.flow()",
    codeBody: "screen -> server -> data -> response",
  },
  {
    title: "REVIEW",
    description: "PR 피드백을 통해 내 기능에서 팀 전체 기준으로 시야를 넓혔습니다.",
    meta: "github pr / code review / team standard",
    color: "#1d2030",
    codeTitle: "pullRequest.diff()",
    codeBody: "read -> question -> reflect -> explain",
  },
  {
    title: "BUILD",
    description: "아이디어를 실제 기능으로 옮기며 화면, 서버, 데이터의 연결을 익히고 있습니다.",
    meta: "react / spring boot / postgresql",
    color: "#1d2529",
    codeTitle: "feature.complete()",
    codeBody: "idea -> component -> api -> persist",
  },
];

const flowText = {
  screen: {
    title: "Screen",
    body: "화면에서 발생한 요청이 어떤 값으로 전달되는지 먼저 확인했습니다.",
  },
  api: {
    title: "API",
    body: "서버에서 어떤 조건으로 처리되는지 따라가며 원인을 좁혔습니다.",
  },
  data: {
    title: "Data",
    body: "저장된 데이터와 응답 값이 화면 흐름과 맞는지 함께 확인했습니다.",
  },
  review: {
    title: "Review",
    body: "PR 피드백을 통해 내 기능만이 아니라 팀 전체 기준을 보려 했습니다.",
  },
};

const setTheme = (theme) => {
  state.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem("portfolio-theme-v3", theme);
};

const hideLoader = () => {
  if (!loader) return;

  let progress = 0;
  const timer = window.setInterval(() => {
    progress += Math.ceil(Math.random() * 18);
    const safeProgress = Math.min(progress, 100);

    if (loaderPercent) {
      loaderPercent.textContent = `${safeProgress}%`;
    }

    if (safeProgress >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => loader.classList.add("hidden"), 220);
    }
  }, 80);
};

const updateProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(ratio * 100, 100)}%`;
  }

  header?.classList.toggle("scrolled", window.scrollY > 20);
};

const setActiveSection = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === id);
  });
};

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item) => observer.observe(item));
};

const initSkillBars = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const level = entry.target.dataset.level || "0";
        const bar = entry.target.querySelector(".skill-bar span");
        if (bar) {
          bar.style.width = `${level}%`;
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.55 },
  );

  skillItems.forEach((item) => observer.observe(item));
};

const initSectionSpy = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveSection(visible.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0, 0.25, 0.5],
    },
  );

  sections.forEach((section) => observer.observe(section));
};

const closeMenu = () => {
  state.menuOpen = false;
  navMenu?.classList.remove("active");
  menuToggle?.classList.remove("active");
  menuToggle?.setAttribute("aria-label", "메뉴 열기");
};

const toggleMenu = () => {
  state.menuOpen = !state.menuOpen;
  navMenu?.classList.toggle("active", state.menuOpen);
  menuToggle?.classList.toggle("active", state.menuOpen);
  menuToggle?.setAttribute("aria-label", state.menuOpen ? "메뉴 닫기" : "메뉴 열기");
};

const initNavigation = () => {
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  menuToggle?.addEventListener("click", toggleMenu);

  document.querySelector("[data-open-menu]")?.addEventListener("click", toggleMenu);

  document.addEventListener("click", (event) => {
    if (!state.menuOpen || !navMenu || !menuToggle) return;
    if (navMenu.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu();
  });
};

class PortfolioSlider {
  constructor() {
    this.current = 0;
    this.timer = null;
    this.locked = false;
    this.root = document.querySelector("[data-slider]");
    this.title = document.getElementById("sliderTitle");
    this.description = document.getElementById("sliderDescription");
    this.meta = document.getElementById("sliderMeta");
    this.images = document.getElementById("sliderImages");
    this.currentText = document.getElementById("sliderCurrent");
    this.totalText = document.getElementById("sliderTotal");

    if (!this.root || !this.title || !this.images) return;

    this.totalText.textContent = String(sliderData.length).padStart(2, "0");
    this.buildSlides();
    this.update(0, true);
    this.bind();
    this.play();
  }

  mod(index) {
    return ((index % sliderData.length) + sliderData.length) % sliderData.length;
  }

  buildSlides() {
    this.slides = sliderData.map((slide, index) => {
      const element = document.createElement("article");
      element.className = "slider-slide";
      element.dataset.index = String(index);
      element.innerHTML = `
        <div class="slide-media" style="--slide-bg: ${slide.color}">
          ${
            slide.image
              ? `<img src="${slide.image}" alt="윤종민 프로필 사진" />`
              : `<div class="slide-pattern" aria-hidden="true">
                  <span>const step = "${slide.title.toLowerCase()}";</span>
                  <span>if (understood) return build();</span>
                  <span>review.diff().then(reflect);</span>
                </div>`
          }
        </div>
        <div class="slide-code">
          <strong>${slide.codeTitle}</strong>
          <span>${slide.codeBody}</span>
        </div>
      `;
      this.images.appendChild(element);
      return element;
    });
  }

  renderTitle(text) {
    this.title.classList.add("is-changing");
    window.setTimeout(() => {
      this.title.textContent = text;
      this.title.classList.remove("is-changing");
    }, 90);
  }

  getStep(index) {
    let step = index - this.current;
    const half = sliderData.length / 2;
    if (step > half) step -= sliderData.length;
    if (step < -half) step += sliderData.length;
    return step;
  }

  update(nextIndex, initial = false) {
    this.current = this.mod(nextIndex);
    const active = sliderData[this.current];

    this.renderTitle(active.title);
    this.description.textContent = active.description;
    this.meta.textContent = active.meta;
    this.currentText.textContent = String(this.current + 1).padStart(2, "0");

    this.slides.forEach((slide, index) => {
      const step = this.getStep(index);
      const absStep = Math.abs(step);
      const x = step * 96;
      const y = step * 58;
      const rotation = step * 6;
      const scale = absStep === 0 ? 1 : absStep === 1 ? 0.88 : 0.72;
      const opacity = absStep === 0 ? 1 : absStep === 1 ? 0.42 : 0;

      slide.style.zIndex = String(10 - absStep);
      slide.style.opacity = String(opacity);
      slide.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
      slide.classList.toggle("active", step === 0);
      if (initial) slide.style.transitionDuration = "0ms";
      window.requestAnimationFrame(() => {
        slide.style.transitionDuration = "";
      });
    });
  }

  go(direction) {
    if (this.locked) return;
    this.locked = true;
    const delta = direction === "next" ? 1 : -1;
    this.update(this.current + delta);
    this.play();
    window.setTimeout(() => {
      this.locked = false;
    }, 980);
  }

  play() {
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.go("next"), 5200);
  }

  bind() {
    document.querySelector("[data-slider-prev]")?.addEventListener("click", () => this.go("prev"));
    document.querySelector("[data-slider-next]")?.addEventListener("click", () => this.go("next"));

    this.root.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaY) < 24) return;
        event.preventDefault();
        this.go(event.deltaY > 0 ? "next" : "prev");
      },
      { passive: false },
    );

    let startY = 0;
    this.root.addEventListener(
      "touchstart",
      (event) => {
        startY = event.touches[0].clientY;
      },
      { passive: true },
    );

    this.root.addEventListener(
      "touchend",
      (event) => {
        const diff = startY - event.changedTouches[0].clientY;
        if (Math.abs(diff) < 42) return;
        this.go(diff > 0 ? "next" : "prev");
      },
      { passive: true },
    );

    window.addEventListener("keydown", (event) => {
      if (!this.root.matches(":hover")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") this.go("next");
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") this.go("prev");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        window.clearInterval(this.timer);
      } else {
        this.play();
      }
    });
  }
}

const initFlowTabs = () => {
  document.querySelectorAll(".flow-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = flowText[tab.dataset.flow];
      if (!selected || !flowPanel) return;

      document.querySelectorAll(".flow-tab").forEach((button) => {
        button.classList.toggle("active", button === tab);
      });

      flowPanel.innerHTML = `<strong>${selected.title}</strong><span>${selected.body}</span>`;
    });
  });
};

const initContactCopy = () => {
  copyEmail?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("yxh750501@gmail.com");
      copyEmail.querySelector("strong").textContent = "복사 완료";
      window.setTimeout(() => {
        copyEmail.querySelector("strong").textContent = "이메일 복사";
      }, 1400);
    } catch {
      window.location.href = "mailto:yxh750501@gmail.com";
    }
  });
};

setTheme(state.theme);
hideLoader();
initReveal();
initSkillBars();
initSectionSpy();
initNavigation();
initFlowTabs();
initContactCopy();
updateProgress();
new PortfolioSlider();

themeToggle?.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
