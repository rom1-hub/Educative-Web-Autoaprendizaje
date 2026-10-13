/* ==========================================================
   COQ — INTERACCIONES GLOBALES
   Solo comportamiento compartido; la estructura permanece en HTML.
   ========================================================== */
(() => {
  "use strict";
  const toggle = document.querySelector("[data-menu-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    links.classList.toggle("is-open", !expanded);
    toggle.setAttribute("aria-label", expanded ? "Abrir menú" : "Cerrar menú");
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      links.classList.remove("is-open");
    }
  });
})();
