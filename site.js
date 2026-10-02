/* =========================================================
   AFRICADÔME — comportements communs à toutes les pages
   (en-tête, menu mobile, recherche, filtres, favoris, newsletter, notifications)
   ========================================================= */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Menus déroulants (Afrique, langue) ---------- */
$$(".dropdown").forEach((dd) => {
  const btn = $("button", dd);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !dd.classList.contains("is-open");
    $$(".dropdown").forEach((d) => d.classList.remove("is-open"));
    dd.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open);
  });
});
document.addEventListener("click", () => $$(".dropdown").forEach((d) => d.classList.remove("is-open")));

$$("[data-lang]").forEach((b) =>
  b.addEventListener("click", () => ($("#langLabel").textContent = b.dataset.lang))
);

/* ---------- Menu mobile ---------- */
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");
function setMobileMenu(open) {
  mobileMenu.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", open);
  $(".material-symbols-outlined", burger).textContent = open ? "close" : "menu";
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMobileMenu(!mobileMenu.classList.contains("is-open")));
$$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => setMobileMenu(false)));

/* ---------- Recherche ---------- */
const searchBar = $("#searchBar");
$("#searchBtn").addEventListener("click", () => {
  const open = searchBar.classList.toggle("is-open");
  if (open) setTimeout(() => $("input", searchBar).focus(), 250);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchBar.classList.remove("is-open");
    setMobileMenu(false);
  }
});

/* ---------- Groupes de filtres (une seule puce active par groupe) ---------- */
$$("[data-chip-group]").forEach((group) => {
  const chips = $$(".chip", group);
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    })
  );
});

/* ---------- Boutons favoris / rappels (bascule) ---------- */
$$("[data-toggle-fill]").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.classList.toggle("is-on");
  })
);

/* ---------- Newsletter ---------- */
const newsletter = $("#newsletter");
if (newsletter) {
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    newsletter.reset();
    $("#newsletterMsg").classList.remove("hidden");
  });
}

/* ---------- Notification courte (toast) ---------- */
let toastEl, toastTimer;
function toast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
}

// Boutons de fonctionnalités à venir : data-soon="message"
$$("[data-soon]").forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    toast(el.dataset.soon);
  })
);

/* ---------- Thème clair / sombre (mémorisé dans le navigateur) ---------- */
(function themeToggle() {
  const btn = $("#themeBtn");
  if (!btn) return;
  const root = document.documentElement;
  // Le logo d'origine a un texte blanc : version à texte sombre pour le mode clair
  const logos = $$("img[src=\"logo.png\"]");
  function sync() {
    const light = root.classList.contains("light");
    logos.forEach((img) => (img.src = light ? "logo-clair.png" : "logo.png"));
    $(".material-symbols-outlined", btn).textContent = light ? "dark_mode" : "light_mode";
    btn.setAttribute("aria-label", light ? "Passer en mode sombre" : "Passer en mode clair");
    btn.setAttribute("aria-pressed", light);
  }
  btn.addEventListener("click", () => {
    const light = root.classList.toggle("light");
    try { localStorage.setItem("africadome-theme", light ? "light" : "dark"); } catch (e) {}
    sync();
  });
  sync();
})();
