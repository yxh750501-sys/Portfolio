const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("section[id]");
const revealItems = document.querySelectorAll(".reveal");
const copyEmail = document.getElementById("copyEmail");

const setActiveLink = () => {
  const currentY = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");
    const link = document.querySelector(`.site-nav a[href="#${id}"]`);

    if (!link) return;
    link.classList.toggle("active", currentY >= top && currentY < bottom);
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
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
};

copyEmail?.addEventListener("click", async () => {
  const email = "yxh750501@gmail.com";
  const originalText = copyEmail.textContent;

  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = "복사 완료";

    window.setTimeout(() => {
      copyEmail.textContent = originalText;
    }, 1500);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    window.setTimeout(setActiveLink, 100);
  });
});

initReveal();
setActiveLink();

window.addEventListener("scroll", setActiveLink, { passive: true });
