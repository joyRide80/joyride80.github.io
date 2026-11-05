/**
 * Contact drawer — slide-up panel with social links
 */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("contact-drawer");
  const triggers = document.querySelectorAll("[data-open-contact-drawer]");

  if (!drawer) return;

  let isOpen = false;
  let activeTrigger = null;
  drawer.setAttribute("aria-hidden", "true");
  triggers.forEach((el) => {
    el.setAttribute("aria-controls", "contact-drawer");
    el.setAttribute("aria-expanded", "false");
  });

  function suppressMotionOnce() {
    drawer.classList.add("is-motion-suppressed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawer.classList.remove("is-motion-suppressed");
      });
    });
  }

  function toggleDrawer(trigger, instant = false) {
    if (instant) suppressMotionOnce();
    isOpen = !isOpen;
    activeTrigger = isOpen ? trigger : activeTrigger;
    drawer.classList.toggle("is-open", isOpen);
    drawer.setAttribute("aria-hidden", String(!isOpen));
    triggers.forEach((el) =>
      el.setAttribute("aria-expanded", String(isOpen)),
    );
    if (isOpen) {
      requestAnimationFrame(() => drawer.querySelector("a")?.focus());
    } else {
      activeTrigger?.focus();
      activeTrigger = null;
    }
  }

  function closeDrawer(instant = false, restoreFocus = true) {
    if (instant) suppressMotionOnce();
    isOpen = false;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    triggers.forEach((el) => el.setAttribute("aria-expanded", "false"));
    if (restoreFocus) activeTrigger?.focus();
    activeTrigger = null;
  }

  triggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDrawer(el, e.detail === 0);
    });
    if (el.getAttribute("role") === "button") {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDrawer(el, true);
        }
      });
    }
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !drawer.contains(e.target) &&
      !e.target.closest("[data-open-contact-drawer]")
    ) {
      closeDrawer(false, false);
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeDrawer(true);
    }
  });
});
