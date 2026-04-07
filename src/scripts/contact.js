/**
 * Contact drawer — slide-up panel with social links
 */

document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("contact-drawer");
  const buttons = document.querySelectorAll("#btn-contact");

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

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDrawer();
    });
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !drawer.contains(e.target) &&
      !e.target.closest("#btn-contact")
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
