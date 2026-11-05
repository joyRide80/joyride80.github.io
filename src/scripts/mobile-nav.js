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
  const pageSiblings = Array.from(document.body.children).filter(
    (element) => element !== root && element.tagName !== "SCRIPT",
  );

  function setPageInert(value) {
    pageSiblings.forEach((element) => {
      element.inert = value;
    });
  }

  function focusableElements() {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  function suppressMotionOnce() {
    root.classList.add("is-motion-suppressed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("is-motion-suppressed");
      });
    });
  }

  function open(instant = false) {
    if (instant) suppressMotionOnce();
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    setPageInert(true);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => focusableElements()[0]?.focus());
  }

  function close(instant = false, restoreFocus = true) {
    if (instant) suppressMotionOnce();
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    setPageInert(false);
    document.body.style.overflow = "";
    if (restoreFocus) toggle.focus();
  }

  function isOpen() {
    return root.classList.contains("is-open");
  }

  toggle.addEventListener("click", (event) => {
    const instant = event.detail === 0;
    if (isOpen()) close(instant);
    else open(instant);
  });

  backdrop.addEventListener("click", () => close());

  panel.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener("click", (event) => close(event.detail === 0));
  });

  panel.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-contact-drawer]")) {
      close(e.detail === 0, false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === "Tab" && isOpen()) {
      const focusable = focusableElements();
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
});
