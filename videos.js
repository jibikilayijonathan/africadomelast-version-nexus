/* =========================================================
   AFRICADÔME — page Vidéos
   Filtres par format et région, tri par popularité, carrousel, lecteur
   ========================================================= */

(function videosPage() {
  const sections = [
    { cards: $$("#origTrack .video-card"), empty: $("#origTrack").parentElement.querySelector("[data-empty]") },
    { cards: $$("#topGrid .top-card"), empty: $("#topGrid").parentElement.querySelector("[data-empty]") },
  ];
  let format = "";
  let region = "";

  function apply() {
    sections.forEach(({ cards, empty }) => {
      let visible = 0;
      cards.forEach((card) => {
        const ok =
          (!format || card.dataset.format.split(" ").includes(format)) &&
          (!region || card.dataset.region === region);
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible++;
      });
      empty.classList.toggle("hidden", visible > 0);
    });
  }

  $$("#formatChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      format = chip.dataset.format;
      apply();
    })
  );

  // Filtre par région (menu du globe)
  const regionLabel = $("#regionLabel");
  $$("[data-region]", $(".dropdown-menu", $("#sortViews").parentElement)).forEach((item) =>
    item.addEventListener("click", () => {
      region = item.dataset.region;
      regionLabel.textContent = region ? `Région : ${item.textContent}` : "";
      regionLabel.classList.toggle("hidden", !region);
      apply();
    })
  );

  // Tri des séries originales par nombre de vues (bascule)
  const track = $("#origTrack");
  const original = $$(".video-card", track);
  let sorted = false;
  $("#sortViews").addEventListener("click", (e) => {
    sorted = !sorted;
    e.currentTarget.classList.toggle("is-on", sorted);
    const list = sorted ? [...original].sort((a, b) => b.dataset.views - a.dataset.views) : original;
    list.forEach((c) => track.appendChild(c));
    track.scrollLeft = 0;
  });

  // Carrousel des séries originales
  const step = () => track.clientWidth * 0.9;
  $("#origPrev").addEventListener("click", () => track.scrollBy({ left: -step() }));
  $("#origNext").addEventListener("click", () => track.scrollBy({ left: step() }));

  // Ajouter à ma liste
  const addBtn = $("#addToList");
  addBtn.addEventListener("click", () => {
    const on = addBtn.getAttribute("aria-pressed") !== "true";
    addBtn.setAttribute("aria-pressed", on);
    $(".material-symbols-outlined", addBtn).textContent = on ? "bookmark_added" : "bookmark_add";
    $("span:last-child", addBtn).textContent = on ? "Dans ma liste" : "Ajouter à ma liste";
    addBtn.classList.toggle("text-primary", on);
  });

  // Lecteur (fenêtre modale)
  const player = $("#player");
  let lastFocus = null;
  function openPlayer(title, img) {
    lastFocus = document.activeElement;
    $("#playerTitle").textContent = title;
    $("#playerImg").src = img;
    player.hidden = false;
    document.body.style.overflow = "hidden";
    $("#playerClose").focus();
  }
  function closePlayer() {
    player.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-play]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openPlayer(el.dataset.title, el.dataset.img);
    });
    // Les cartes (article) deviennent activables au clavier
    if (el.tagName !== "BUTTON") {
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Regarder : " + el.dataset.title);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPlayer(el.dataset.title, el.dataset.img); }
      });
    }
  });
  $("#playerClose").addEventListener("click", closePlayer);
  player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !player.hidden) closePlayer(); });
})();
