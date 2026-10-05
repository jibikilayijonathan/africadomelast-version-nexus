/* =========================================================
   AFRICADÔME — page Culture & arts visuels
   Filtres des collections, carrousel, audioguide, baromètre, carnet
   ========================================================= */

(function culturePage() {
  /* ---------- Filtres des collections ---------- */
  const track = $("#artTrack");
  const cards = $$(".art-card", track);
  const empty = track.parentElement.querySelector("[data-empty]");
  $$("#artFilters .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const cat = chip.dataset.cat;
      let visible = 0;
      cards.forEach((card) => {
        const ok = !cat || card.dataset.cat.split(" ").includes(cat);
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible++;
      });
      empty.classList.toggle("hidden", visible > 0);
      track.scrollLeft = 0;
    })
  );

  /* ---------- Carrousel ---------- */
  const step = () => track.clientWidth * 0.9;
  $("#artPrev").addEventListener("click", () => track.scrollBy({ left: -step() }));
  $("#artNext").addEventListener("click", () => track.scrollBy({ left: step() }));

  /* ---------- Audioguide (synthèse vocale du navigateur) ---------- */
  const guide = $("#audioGuide");
  const synth = window.speechSynthesis;
  let speaking = false;
  function setGuide(on) {
    speaking = on;
    guide.setAttribute("aria-pressed", on);
    $(".material-symbols-outlined", guide).textContent = on ? "pause" : "headphones";
    $("span:last-child", guide).textContent = on ? "Audioguide en cours…" : "Audioguide (24 min)";
  }
  guide.addEventListener("click", () => {
    if (!synth) { toast("L'audioguide n'est pas disponible sur ce navigateur."); return; }
    if (speaking) { synth.cancel(); setGuide(false); return; }
    const hero = guide.closest("section");
    const text = [$("h2", hero).textContent, $("p", hero).textContent].join(". ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = window.AFD_SPEECH_LANG || "fr-FR";
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith(utter.lang.slice(0, 2)));
    if (voice) utter.voice = voice;
    utter.onend = utter.onerror = () => setGuide(false);
    synth.cancel();
    synth.speak(utter);
    setGuide(true);
  });
  window.addEventListener("beforeunload", () => synth && synth.cancel());

  /* ---------- Baromètre : barres animées à l'apparition ---------- */
  const bars = $$("#marketBars .hub-bar > span");
  const fill = () => bars.forEach((b) => (b.style.width = b.dataset.w + "%"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { fill(); obs.disconnect(); }
    }, { threshold: 0.3 });
    io.observe($("#marketBars"));
  } else fill();

  /* ---------- Carnet des conservateurs ---------- */
  $("#curatorForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    const msg = $("#curatorMsg");
    msg.textContent = "Merci ! Votre inscription au carnet est enregistrée.";
    msg.classList.add("!text-secondary");
  });
})();
