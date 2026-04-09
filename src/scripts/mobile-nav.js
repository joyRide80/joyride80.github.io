/**
 * Small-screen hamburger menu — Work, About, Get in touch
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-mobile-nav]");
  if (!root) return;

  const toggle = document.getElementById("mobile-nav-toggle");
  const panel = document.getElementById("mobile-nav-panel");
  const backdrop = document.getElementById("mobile-nav-backdrop");

  if (!toggle || !panel || !backdrop) return;

  function open() {
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    toggle.focus();
  }

  function isOpen() {
    return root.classList.contains("is-open");
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) close();
    else open();
  });

  backdrop.addEventListener("click", close);

  panel.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener("click", () => close());
  });

  panel.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-contact-drawer]")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      close();
    }
  });
});
