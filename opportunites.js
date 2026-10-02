/* =========================================================
   AFRICADÔME — page Opportunités
   Filtres (texte, type, région, statut, domaine) et tri des appels récents
   ========================================================= */

(function opportunities() {
  const grid = $("#oppGrid");
  const cards = $$(".opp-card", grid);
  const search = $("#oppSearch");
  const type = $("#oppType");
  const region = $("#oppRegion");
  const status = $("#oppStatus");
  const sort = $("#oppSort");
  let domain = "";

  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function apply() {
    const q = normalize(search.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const ok =
        (!q || normalize(card.textContent).includes(q)) &&
        (!type.value || card.dataset.type === type.value) &&
        (!region.value || card.dataset.region === region.value) &&
        matchStatus(card) &&
        (!domain || card.dataset.domain.split(" ").includes(domain));
      card.classList.toggle("is-hidden", !ok);
      if (ok) visible++;
    });
    $("#oppCount").textContent = visible;
    $("#oppEmpty").classList.toggle("hidden", visible > 0);
  }

  // "Clôture imminente" = moins de 3 semaines ; les autres statuts viennent de data-status
  function matchStatus(card) {
    if (!status.value) return true;
    if (status.value === "urgent") return +card.dataset.days <= 21;
    return card.dataset.status === status.value;
  }

  function applySort() {
    const by = {
      cloture: (a, b) => a.dataset.days - b.dataset.days,
      dotation: (a, b) => b.dataset.amount - a.dataset.amount,
      recent: (a, b) => cards.indexOf(a) - cards.indexOf(b),
    };
    const sorted = [...cards].sort(by[sort.value] || by.recent);
    sorted.forEach((c) => grid.appendChild(c));
  }

  search.addEventListener("input", apply);
  type.addEventListener("change", apply);
  region.addEventListener("change", apply);
  status.addEventListener("change", apply);
  sort.addEventListener("change", applySort);
  $$("#oppDomains .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      domain = chip.dataset.domain;
      apply();
    })
  );

  // Carrousel "clôture imminente"
  const track = $("#urgentTrack");
  const step = () => track.clientWidth * 0.9;
  $("#urgentPrev").addEventListener("click", () => track.scrollBy({ left: -step() }));
  $("#urgentNext").addEventListener("click", () => track.scrollBy({ left: step() }));
})();
