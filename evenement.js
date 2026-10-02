/* =========================================================
   AFRICADÔME — page Événement (Création Fest 2027)
   Compte à rebours, onglets de section, filtre du programme,
   alerte billetterie
   ========================================================= */

(function evenementPage() {
  /* ---------- Compte à rebours (ouverture : 14 mai 2027, 18 h à Dakar, UTC+0) ---------- */
  const OPENING = Date.UTC(2027, 4, 14, 18, 0, 0);
  const cd = $("#countdown");
  const parts = {};
  $$("[data-cd]", cd).forEach((el) => (parts[el.dataset.cd] = el));
  const pad = (n) => String(n).padStart(2, "0");
  let timer;
  function tick() {
    const left = Math.max(0, OPENING - Date.now());
    const s = Math.floor(left / 1000);
    parts.days.textContent = Math.floor(s / 86400);
    parts.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    parts.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    parts.seconds.textContent = pad(s % 60);
    if (!left) {
      clearInterval(timer);
      cd.closest("div").querySelector(".uppercase").textContent = "Le festival est ouvert !";
    }
  }
  tick();
  timer = setInterval(tick, 1000);

  /* ---------- Onglets : défilement + section active ---------- */
  const tabs = $$("#eventTabs .chip");
  const setActive = (id) => tabs.forEach((t) => t.classList.toggle("is-active", t.getAttribute("href") === "#" + id));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$(".event-section").forEach((sec) => io.observe(sec));
  }
  tabs.forEach((t) => t.addEventListener("click", () => {
    setActive(t.getAttribute("href").slice(1));
    t.scrollIntoView({ block: "nearest", inline: "center" });
  }));

  /* ---------- Programme : filtre par jour ---------- */
  const cards = $$("#progGrid .prog-card");
  $$("#dayChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const day = chip.dataset.day;
      cards.forEach((c) => c.classList.toggle("is-hidden", !!day && c.dataset.day !== day));
    })
  );

  /* ---------- Alerte billetterie ---------- */
  $("#ticketForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    $("#ticketMsg").classList.remove("hidden");
    toast("Inscription confirmée : vous recevrez l'alerte billetterie.");
  });
})();
