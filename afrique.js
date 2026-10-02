/* =========================================================
   AFRICADÔME — page Afrique (cartographie culturelle)
   Pôles interactifs, filtre par région (aussi via ?region=…),
   rappels festivals
   ========================================================= */

(function afriquePage() {
  // Chiffres indicatifs, à relier à la base de l'Observatoire
  const HUBS = {
    "dakar-abidjan": {
      tag: "Afrique de l'Ouest • Pôle majeur", title: "Dakar & Abidjan",
      focus: "Pôle cinéma, mode & musiques urbaines",
      desc: "Entre les séries télévisées d'Abidjan et les ateliers d'art de Dakar, un axe d'une grande effervescence stylistique.",
      creators: "620+", festivals: "11 événements", opps: "19 appels & bourses",
    },
    "lagos-accra": {
      tag: "Golfe de Guinée • Hypercentre", title: "Lagos & Accra",
      focus: "Épicentre afrobeats, Nollywood & tech",
      desc: "Mégalopoles créatives dont les industries musicales et cinématographiques rayonnent bien au-delà du continent.",
      creators: "940+", festivals: "15 événements", opps: "28 appels & bourses",
    },
    "douala-kinshasa": {
      tag: "Afrique Centrale • Pôle émergent", title: "Douala & Kinshasa",
      focus: "Rumba, makossa, arts plastiques & cinéma",
      desc: "Deux métropoles bouillonnantes où la musique, la peinture populaire et une nouvelle génération de cinéastes réinventent les récits urbains.",
      creators: "390+", festivals: "6 événements", opps: "9 appels & bourses",
    },
    "nairobi-kigali": {
      tag: "Afrique de l'Est • Pôle majeur", title: "Nairobi & Kigali",
      focus: "Hub animation 3D, gaming & sound design",
      desc: "Pionnières de l'économie créative numérique, ces deux capitales redéfinissent la narration visuelle africaine, du jeu vidéo indépendant au son spatial immersif.",
      creators: "480+", festivals: "7 événements", opps: "14 bourses & résidences",
    },
    "casa-caire": {
      tag: "Afrique du Nord • Patrimoine & contemporain", title: "Casablanca & Le Caire",
      focus: "Arts visuels, design & patrimoine vivant",
      desc: "Un carrefour méditerranéen où l'architecture moderniste rencontre le cinéma d'auteur et l'art contemporain.",
      creators: "530+", festivals: "9 événements", opps: "16 bourses & résidences",
    },
    "joburg-maputo": {
      tag: "Afrique Australe • Son & esthétique", title: "Johannesburg & Maputo",
      focus: "Amapiano, arts contemporains & mode éthique",
      desc: "Le berceau de l'amapiano et d'un marché de l'art contemporain parmi les plus dynamiques du continent.",
      creators: "710+", festivals: "12 événements", opps: "21 bourses & résidences",
    },
  };
  const REGION_HUB = { west: "dakar-abidjan", central: "douala-kinshasa", east: "nairobi-kigali", north: "casa-caire", south: "joburg-maputo" };

  const markers = $$(".hub-marker");
  const panel = $("#hubPanel");

  function showHub(key) {
    const d = HUBS[key];
    if (!d) return;
    $("#hubTag").textContent = d.tag;
    $("#hubTitle").textContent = d.title;
    $("#hubFocus").textContent = d.focus;
    $("#hubDesc").textContent = d.desc;
    $("#hubCreators").textContent = d.creators;
    $("#hubFestivals").textContent = d.festivals;
    $("#hubOpps").textContent = d.opps;
    markers.forEach((m) => m.classList.toggle("is-active", m.dataset.hub === key));
    panel.classList.remove("is-updating");
    void panel.offsetWidth; // relance l'animation
    panel.classList.add("is-updating");
  }
  markers.forEach((m) => {
    m.setAttribute("aria-label", "Afficher le pôle " + HUBS[m.dataset.hub].title);
    m.addEventListener("click", () => showHub(m.dataset.hub));
  });

  /* ---------- Filtre par région ---------- */
  const blocks = [
    { cards: $$("#festivalGrid .fest-card"), empty: $("#festivalGrid").parentElement.querySelector("[data-empty]") },
    { cards: $$("#dossierGrid .dossier-card"), empty: $("#dossierGrid").parentElement.querySelector("[data-empty]") },
  ];
  const chips = $$("#regionNav .chip");

  function setRegion(region) {
    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.region === region));
    blocks.forEach(({ cards, empty }) => {
      let visible = 0;
      cards.forEach((card) => {
        const ok = region === "all" || card.dataset.region === region;
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible++;
      });
      empty.classList.toggle("hidden", visible > 0);
    });
    markers.forEach((m) => m.classList.toggle("is-dim", region !== "all" && m.dataset.region !== region));
    if (REGION_HUB[region]) showHub(REGION_HUB[region]);
    const url = new URL(location.href);
    if (region === "all") url.searchParams.delete("region");
    else url.searchParams.set("region", region);
    history.replaceState(null, "", url);
  }
  chips.forEach((chip) => chip.addEventListener("click", () => setRegion(chip.dataset.region)));

  const fromUrl = new URLSearchParams(location.search).get("region");
  if (fromUrl && chips.some((c) => c.dataset.region === fromUrl)) setRegion(fromUrl);

  /* ---------- Rappels festivals ---------- */
  $$("[data-remind]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("is-on");
      btn.firstChild.textContent = on ? "Rappel activé " : "Me prévenir ";
      toast(on
        ? `Nous vous préviendrons dès l'annonce des dates de ${btn.dataset.remind}.`
        : `Rappel désactivé pour ${btn.dataset.remind}.`);
    })
  );
})();
