const tabs = document.querySelectorAll("[data-target]");
const tabContents = document.querySelectorAll("[data-content]");
const workFilters = document.querySelectorAll(".work-item");
const workCards = document.querySelectorAll(".work-card");
const popup = document.getElementById("portfolioPopup");
const popupBody = document.getElementById("popupBody");
const popupPreview = document.getElementById("popupPreview");
const popupClose = document.querySelector(".portfolio-popup-close");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const sidebar = document.getElementById("sidebar");
const navToggle = document.getElementById("navToggle");
const navClose = document.getElementById("navClose");
const copyEmail = document.getElementById("copyEmail");
const revealItems = document.querySelectorAll(".reveal");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.target);
    if (!target) return;

    tabContents.forEach((content) => content.classList.remove("skills-active"));
    tabs.forEach((item) => item.classList.remove("skills-active"));

    target.classList.add("skills-active");
    tab.classList.add("skills-active");
  });
});

workFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selected = filter.dataset.filter;

    workFilters.forEach((item) => item.classList.remove("active-work"));
    filter.classList.add("active-work");

    workCards.forEach((card) => {
      const categories = card.dataset.category?.split(" ") || [];
      const shouldShow = selected === "all" || categories.includes(selected);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const openPortfolioPopup = (card) => {
  const details = card.querySelector(".portfolio-item-details");
  const title = card.querySelector(".work-title")?.textContent || "Work";
  const preview = card.querySelector(".work-preview");

  if (!details || !popup || !popupBody || !popupPreview) return;

  popupBody.innerHTML = details.innerHTML;
  popupPreview.textContent = title.split(" ")[0] || "Work";
  popupPreview.className = "portfolio-popup-preview";

  if (preview) {
    const previewClass = [...preview.classList].find((className) => className.startsWith("preview-"));
    if (previewClass) popupPreview.classList.add(previewClass);
  }

  popup.classList.add("open");
  popup.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closePortfolioPopup = () => {
  if (!popup) return;
  popup.classList.remove("open");
  popup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

document.addEventListener("click", (event) => {
  const button = event.target.closest(".work-button");
  const popupLink = event.target.closest(".portfolio-popup a[href^='#']");
  if (button) {
    openPortfolioPopup(button.closest(".work-card"));
  }

  if (popupLink) {
    closePortfolioPopup();
  }

  if (event.target === popup) {
    closePortfolioPopup();
  }
});

popupClose?.addEventListener("click", closePortfolioPopup);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePortfolioPopup();
});

const openSidebar = () => {
  sidebar?.classList.add("show-sidebar");
};

const closeSidebar = () => {
  sidebar?.classList.remove("show-sidebar");
};

navToggle?.addEventListener("click", openSidebar);
navClose?.addEventListener("click", closeSidebar);
navLinks.forEach((link) => link.addEventListener("click", closeSidebar));

const setActiveLink = () => {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 80;
    const sectionId = section.getAttribute("id");
    const link = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

    if (!link) return;

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
};

const initReveal = () => {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => observer.observe(item));
};

copyEmail?.addEventListener("click", async () => {
  const email = "yxh750501@gmail.com";
  const subtitle = copyEmail.querySelector(".contact-card-data");
  const action = copyEmail.querySelector(".contact-button");

  try {
    await navigator.clipboard.writeText(email);
    if (subtitle) subtitle.textContent = "복사 완료";
    if (action) action.textContent = email;

    window.setTimeout(() => {
      if (subtitle) subtitle.textContent = "클릭하면 이메일을 복사합니다";
      if (action) action.innerHTML = '복사하기 <i class="uil uil-arrow-right"></i>';
    }, 1500);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

initReveal();
setActiveLink();

window.addEventListener("scroll", setActiveLink, { passive: true });
