/* =========================================================
   AFRICADÔME — page Afrique (cartographie culturelle)
   Pôles interactifs, filtre par région (aussi via ?region=…),
   rappels festivals
   ========================================================= */

(function afriquePage() {
  // Les 11 États membres de la CEEAC — chiffres indicatifs, à relier à la base de l'Observatoire
  const HUBS = {
    "cameroun": {
      tag: "CEEAC • Capitale : Yaoundé", title: "Cameroun",
      focus: "Makossa, bikutsi, cinéma & arts visuels",
      desc: "De Douala à Yaoundé, une scène foisonnante portée par le makossa, le bikutsi et un cinéma en plein essor, avec le festival Écrans Noirs comme rendez-vous majeur.",
      creators: "420+", festivals: "6 événements", opps: "11 appels & bourses",
    },
    "rdc": {
      tag: "CEEAC • Capitale : Kinshasa", title: "RD Congo",
      focus: "Rumba, peinture populaire & mode",
      desc: "Kinshasa, berceau de la rumba congolaise inscrite au patrimoine immatériel de l'UNESCO, de la peinture populaire et de la culture de la sape.",
      creators: "610+", festivals: "8 événements", opps: "9 appels & bourses",
    },
    "congo": {
      tag: "CEEAC • Capitale : Brazzaville", title: "Congo",
      focus: "Rumba, musiques & arts plastiques",
      desc: "Brazzaville accueille le FESPAM, festival panafricain de musique, et partage avec Kinshasa l'héritage de la rumba congolaise.",
      creators: "230+", festivals: "4 événements", opps: "5 appels & bourses",
    },
    "gabon": {
      tag: "CEEAC • Capitale : Libreville", title: "Gabon",
      focus: "Patrimoine, musiques & cinéma",
      desc: "De Libreville aux forêts de l'intérieur, une création nourrie par les traditions du bwiti, l'art des masques et une jeune scène urbaine.",
      creators: "160+", festivals: "3 événements", opps: "4 appels & bourses",
    },
    "guinee-eq": {
      tag: "CEEAC • Capitale : Malabo", title: "Guinée équatoriale",
      focus: "Danses traditionnelles & création insulaire",
      desc: "Entre Malabo, sur l'île de Bioko, et Bata sur le continent, des traditions comme le balélé dialoguent avec une scène artistique émergente.",
      creators: "70+", festivals: "2 événements", opps: "2 appels & bourses",
    },
    "sao-tome": {
      tag: "CEEAC • Capitale : São Tomé", title: "Sao Tomé-et-Principe",
      focus: "Théâtre, musique & arts insulaires",
      desc: "Le tchiloli, théâtre populaire unique, et les rythmes de l'ússua font de l'archipel un carrefour culturel lusophone de l'Atlantique.",
      creators: "50+", festivals: "2 événements", opps: "2 appels & bourses",
    },
    "tchad": {
      tag: "CEEAC • Capitale : N'Djamena", title: "Tchad",
      focus: "Musiques sahéliennes & patrimoine",
      desc: "N'Djamena, au carrefour du Sahel et de l'Afrique centrale, où se mêlent musiques traditionnelles, poésie orale et nouvelles scènes urbaines.",
      creators: "110+", festivals: "3 événements", opps: "3 appels & bourses",
    },
    "rca": {
      tag: "CEEAC • Capitale : Bangui", title: "République centrafricaine",
      focus: "Polyphonies & traditions vivantes",
      desc: "Les chants polyphoniques des Pygmées Aka, inscrits au patrimoine immatériel de l'UNESCO, et une scène musicale résiliente à Bangui.",
      creators: "60+", festivals: "2 événements", opps: "2 appels & bourses",
    },
    "rwanda": {
      tag: "CEEAC • Capitale : Kigali", title: "Rwanda",
      focus: "Danse intore, imigongo & tech créative",
      desc: "Kigali s'affirme comme un pôle créatif et numérique, entre danse intore, art imigongo et jeunes studios de design.",
      creators: "290+", festivals: "5 événements", opps: "8 appels & bourses",
    },
    "burundi": {
      tag: "CEEAC • Capitale : Gitega", title: "Burundi",
      focus: "Tambours royaux & musiques",
      desc: "Le rituel de la danse du tambour royal, inscrit au patrimoine immatériel de l'UNESCO, rythme une culture musicale reconnue bien au-delà de Bujumbura.",
      creators: "90+", festivals: "2 événements", opps: "3 appels & bourses",
    },
    "angola": {
      tag: "CEEAC • Capitale : Luanda", title: "Angola",
      focus: "Semba, kizomba & kuduro",
      desc: "De Luanda au monde lusophone, l'Angola a donné naissance au semba, à la kizomba et au kuduro, moteurs d'une industrie musicale dynamique.",
      creators: "380+", festivals: "5 événements", opps: "7 appels & bourses",
    },
  };
  const REGION_HUB = { central: "cameroun" };

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
    m.setAttribute("aria-label", "Afficher la fiche " + HUBS[m.dataset.hub].title);
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
