/* =========================================================
   AFRICADÔME — page Créateurs
   Filtres de l'annuaire (texte, territoire, disponibilité, métier) et partage
   ========================================================= */

(function creators() {
  const cards = $$("#creatorGrid .creator-card");
  const search = $("#creatorSearch");
  const country = $("#creatorCountry");
  const avail = $("#creatorAvail");
  let metier = "";

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function apply() {
    const q = normalize(search.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const ok =
        (!q || normalize(card.textContent).includes(q)) &&
        (!country.value || card.dataset.country === country.value) &&
        (!avail.value || card.dataset.avail === avail.value) &&
        (!metier || card.dataset.metier === metier);
      card.classList.toggle("is-hidden", !ok);
      if (ok) visible++;
    });
    $("#creatorCount").textContent = visible;
    $("#creatorEmpty").classList.toggle("hidden", visible > 0);
  }

  search.addEventListener("input", apply);
  country.addEventListener("change", apply);
  avail.addEventListener("change", apply);
  $$("#creatorChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      metier = chip.dataset.metier;
      apply();
    })
  );

  // Partage de la couverture du mois
  $("#shareBtn").addEventListener("click", async () => {
    const data = { title: "Amani Wangari — Africadôme", url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch (_) { /* partage annulé */ }
  });
})();
