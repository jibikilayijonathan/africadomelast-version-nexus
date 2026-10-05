/* =========================================================
   AFRICADÔME — fiche d'un podcast (podcast-fiche.html?id=…)
   Remplit la page à partir de podcasts-data.js
   ========================================================= */

(function podcastFiche() {
  const id = new URLSearchParams(location.search).get("id");
  const p = PODCASTS[id] || PODCASTS[Object.keys(PODCASTS)[0]];
  const set = (sel, text) => ($(sel).textContent = text);

  /* ---------- En-tête ---------- */
  document.title = p.title + " — Africadôme";
  set("#fCrumb", p.title);
  set("#fTitle", p.title);
  set("#fSeries", p.series + ", " + p.episode);
  set("#fHost", p.host);
  set("#fGuests", p.guests);
  set("#fRating", p.rating);
  set("#fNotes", p.notes);
  $("#fCover").src = p.cover;
  $("#fCover").alt = p.alt;
  set("#fRibbon", /^Série originale|Creative Talks/.test(p.series) ? "Original" : "Africadôme");

  /* ---------- Description & informations ---------- */
  set("#fQuote", p.quote);
  set("#fSummary", p.summary);
  set("#fMore", p.more);
  const toggle = $("#fToggle");
  toggle.addEventListener("click", () => {
    const open = $("#fMore").classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", open);
    $("span:first-child", toggle).textContent = open ? "Afficher moins" : "Afficher plus";
    $(".material-symbols-outlined", toggle).textContent = open ? "expand_less" : "expand_more";
  });
  const tags = $("#fTags");
  p.tags.forEach((t) => {
    const a = document.createElement("a");
    a.href = "radio.html#podcasts";
    a.className = "fiche-tag";
    a.textContent = t;
    tags.appendChild(a);
  });
  set("#mSeries", p.series);
  set("#mDate", p.date);
  set("#mFormat", /×|épisodes/.test(p.duration + p.episode) ? "Série audio" : "Épisode audio intégral");
  set("#mDuration", p.duration);
  set("#mCategory", p.category);

  /* ---------- Écoute (aperçu de démonstration) ---------- */
  const listen = $("#fListen");
  const preview = $("#fPreview");
  let playing = false;
  function setPlaying(on) {
    playing = on;
    $(".material-symbols-outlined", listen).textContent = on ? "pause" : "play_arrow";
    $("span:last-child", listen).textContent = on ? "Mettre en pause" : "Écouter maintenant";
    $(".material-symbols-outlined", preview).textContent = on ? "graphic_eq" : "headphones";
    $("span:last-child", preview).textContent = on ? "Aperçu en cours…" : "Aperçu";
    if (on) toast("Aperçu de démonstration : le fichier audio sera relié à votre hébergement de podcasts.");
  }
  listen.addEventListener("click", () => setPlaying(!playing));
  preview.addEventListener("click", () => setPlaying(!playing));

  const save = $("#fSave");
  save.addEventListener("click", () => {
    const on = save.classList.toggle("is-on");
    $(".material-symbols-outlined", save).textContent = on ? "bookmark_added" : "bookmark_add";
    $("span:last-child", save).textContent = on ? "Dans ma liste" : "Ajouter à ma liste";
  });

  /* ---------- Partage ---------- */
  const url = encodeURIComponent(location.href);
  $("#fFb").href = "https://www.facebook.com/sharer/sharer.php?u=" + url;
  $("#fX").href = "https://twitter.com/intent/tweet?url=" + url + "&text=" + encodeURIComponent(p.title);
  $("#fCopy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Lien copié !"); }
    catch (e) { toast("Copiez l'adresse de la page depuis la barre du navigateur."); }
  });

  /* ---------- Avis ---------- */
  set("#rAvg", p.rating);
  set("#rCount", p.notes);
  set("#rHost", p.hostScore);
  set("#rContent", p.contentScore);
  const reviews = p.reviews.map((i, order) => ({ ...PODCAST_REVIEWS[i], order }));
  const list = $("#rList");
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  function renderReviews() {
    const min = +$("#rFilter").value;
    const mode = $("#rSort").dataset.mode;
    const shown = reviews
      .filter((r) => !min || r.rating === min)
      .sort((a, b) => (mode === "useful" ? b.useful - a.useful : a.order - b.order));
    list.innerHTML = "";
    shown.forEach((r) => {
      const el = document.createElement("article");
      el.className = "fiche-review";
      el.innerHTML = `
        <p class="flex items-center gap-2"><span class="text-title-sm text-white tnum">${r.rating},0</span><span class="stars">${stars(r.rating)}</span></p>
        <h3 class="text-headline-md text-white"></h3>
        <p class="text-body-sm"><span class="text-primary font-semibold" data-author></span> · <span class="text-on-surface-variant" data-when></span></p>
        <p class="text-body-md text-on-surface" data-text></p>
        <p class="flex flex-wrap items-center gap-space-md text-body-sm text-on-surface-variant">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">mic</span><strong class="text-white tnum">${r.host},0</strong> <span>Animation</span></span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">menu_book</span><strong class="text-white tnum">${r.content},0</strong> <span>Contenu</span></span>
        </p>
        <div class="flex items-center justify-between gap-2 text-body-sm text-on-surface-variant">
          <span><span class="tnum" data-useful>${r.useful}</span> <span>personnes ont trouvé cela utile</span></span>
          <button class="fiche-useful"><span class="material-symbols-outlined text-[16px]">thumb_up</span><span>Utile</span></button>
        </div>`;
      $("h3", el).textContent = r.title;
      $("[data-author]", el).textContent = r.author;
      $("[data-when]", el).textContent = r.when;
      $("[data-text]", el).textContent = r.text;
      const btn = $(".fiche-useful", el);
      btn.addEventListener("click", () => {
        const on = btn.classList.toggle("is-on");
        r.useful += on ? 1 : -1;
        $("[data-useful]", el).textContent = r.useful;
      });
      list.appendChild(el);
    });
    $("#rEmpty").classList.toggle("hidden", shown.length > 0);
  }
  $("#rFilter").addEventListener("change", renderReviews);
  $("#rSort").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    btn.dataset.mode = btn.dataset.mode === "useful" ? "recent" : "useful";
    $("span:first-child", btn).textContent = btn.dataset.mode === "useful" ? "Le plus pertinent" : "Le plus récent";
    renderReviews();
  });
  renderReviews();
})();
