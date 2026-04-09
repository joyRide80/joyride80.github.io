/**
 * Contact drawer — slide-up panel with social links
 */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("contact-drawer");
  const triggers = document.querySelectorAll("[data-open-contact-drawer]");

  if (!drawer) return;

  let isOpen = false;

  function toggleDrawer() {
    isOpen = !isOpen;
    drawer.classList.toggle("is-open", isOpen);
  }

  function closeDrawer() {
    isOpen = false;
    drawer.classList.remove("is-open");
  }

  triggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDrawer();
    });
    if (el.getAttribute("role") === "button") {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDrawer();
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
      closeDrawer();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeDrawer();
    }
  });
});
