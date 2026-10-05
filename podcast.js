/* =========================================================
   AFRICADÔME — page Épisode de podcast
   Lecteur simulé (forme d'onde, chapitres, vitesse, volume),
   onglets, transcription synchronisée, commentaires
   ========================================================= */

// URL du fichier audio de l'épisode (laisser vide pour une simulation visuelle)
const EPISODE_AUDIO_URL = "";

(function podcastPage() {
  const TOTAL = 48 * 60;
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  let pos = 13 * 60 + 42;
  let playing = false;
  let speed = 1;
  let timer;

  /* ---------- Forme d'onde & repères de chapitres ---------- */
  const wave = $("#podWave");
  const BARS = 64;
  const bars = Array.from({ length: BARS }, (_, i) => {
    const b = document.createElement("i");
    b.style.height = 25 + Math.abs(Math.sin(i * 1.7) * 55 + Math.cos(i * 0.6) * 20) + "%";
    wave.appendChild(b);
    return b;
  });
  const chapters = $$("#chapterList .chapter");
  const markers = $("#podMarkers");
  chapters.forEach((c) => {
    const m = document.createElement("button");
    m.className = "pod-marker";
    m.style.left = (+c.dataset.start / TOTAL) * 100 + "%";
    m.title = c.dataset.title;
    m.setAttribute("aria-label", c.dataset.title);
    m.addEventListener("click", (e) => { e.stopPropagation(); seek(+c.dataset.start); });
    markers.appendChild(m);
  });

  /* ---------- Rendu de la position ---------- */
  const lines = $$("#transcript .line");
  function render() {
    const ratio = pos / TOTAL;
    $("#podFill").style.width = ratio * 100 + "%";
    const done = Math.round(ratio * BARS);
    bars.forEach((b, i) => b.classList.toggle("is-played", i < done));
    $("#podTime").textContent = fmt(pos);
    $("#podLeft").textContent = fmt(TOTAL - pos);
    $("#podScrub").setAttribute("aria-valuenow", Math.round(pos));
    // Chapitre en cours
    let current = chapters[0];
    chapters.forEach((c) => { if (+c.dataset.start <= pos) current = c; });
    chapters.forEach((c) => {
      const on = c === current;
      c.classList.toggle("is-current", on);
      $(".chapter-icon .material-symbols-outlined", c).textContent = on && playing ? "graphic_eq" : "play_arrow";
    });
    $("#podChapterTitle").textContent = current.dataset.title;
    $$(".pod-marker", markers).forEach((m, i) => m.classList.toggle("is-passed", +chapters[i].dataset.start <= pos));
    // Réplique en cours dans la transcription
    let line = null;
    lines.forEach((l) => { if (+l.dataset.t <= pos) line = l; });
    lines.forEach((l) => l.classList.toggle("is-current", l === line && pos - +l.dataset.t < 120));
  }

  function seek(s) {
    pos = Math.max(0, Math.min(TOTAL, s));
    if (audio) audio.currentTime = pos;
    render();
  }

  /* ---------- Lecture / pause ---------- */
  const audio = EPISODE_AUDIO_URL ? new Audio(EPISODE_AUDIO_URL) : null;
  const playBtn = $("#podPlay");
  function setPlaying(on) {
    playing = on;
    $(".material-symbols-outlined", playBtn).textContent = on ? "pause" : "play_arrow";
    playBtn.setAttribute("aria-label", on ? "Mettre l'épisode en pause" : "Lire l'épisode");
    playBtn.classList.toggle("ring-4", on);
    $("#podDot").classList.toggle("animate-pulse", on);
    clearInterval(timer);
    if (on) {
      if (audio) { audio.currentTime = pos; audio.playbackRate = speed; audio.play().catch(() => {}); }
      timer = setInterval(() => {
        pos = audio ? audio.currentTime : pos + 0.25 * speed;
        if (pos >= TOTAL) { pos = TOTAL; setPlaying(false); }
        render();
      }, 250);
    } else if (audio) audio.pause();
    render();
  }
  playBtn.addEventListener("click", () => setPlaying(!playing));
  $("#podBack").addEventListener("click", () => seek(pos - 10));
  $("#podFwd").addEventListener("click", () => seek(pos + 30));

  const scrub = $("#podScrub");
  scrub.addEventListener("click", (e) => {
    const r = scrub.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * TOTAL);
  });
  scrub.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); seek(pos - 10); }
    if (e.key === "ArrowRight") { e.preventDefault(); seek(pos + 10); }
    if (e.key === " ") { e.preventDefault(); setPlaying(!playing); }
  });

  /* ---------- Vitesse & volume ---------- */
  const SPEEDS = [1, 1.25, 1.5, 2];
  $("#podSpeed").addEventListener("click", (e) => {
    speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    e.currentTarget.textContent = speed + "x";
    if (audio) audio.playbackRate = speed;
  });
  const vol = $("#podVolume");
  const muteIcon = $("#podMute .material-symbols-outlined");
  let lastVol = 75;
  function setVolume(v) {
    vol.value = v;
    muteIcon.textContent = v == 0 ? "volume_off" : v < 50 ? "volume_down" : "volume_up";
    if (audio) audio.volume = v / 100;
  }
  vol.addEventListener("input", () => setVolume(+vol.value));
  $("#podMute").addEventListener("click", () => {
    if (+vol.value > 0) { lastVol = +vol.value; setVolume(0); } else setVolume(lastVol || 75);
  });

  /* ---------- Chapitres & extraits ---------- */
  chapters.forEach((c) => c.addEventListener("click", () => { seek(+c.dataset.start); if (!playing) setPlaying(true); }));
  lines.forEach((l) => $(".line-play", l).addEventListener("click", () => { seek(+l.dataset.t); if (!playing) setPlaying(true); }));

  /* ---------- Onglets ---------- */
  const tabs = $$("#podTabs .pod-tab");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
      const pane = $("#" + t.dataset.target);
      pane.classList.toggle("hidden", !on);
      pane.classList.toggle("flex", on);
    });
  }));

  /* ---------- Recherche dans la transcription ---------- */
  const paragraphs = lines.map((l) => ({ line: l, p: $("p", l), text: $("p", l).textContent }));
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  $("#transcriptSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    let visible = 0;
    paragraphs.forEach(({ line, p }) => {
      const text = p.textContent;
      const i = q ? text.toLowerCase().indexOf(q) : -1;
      const ok = !q || i >= 0;
      line.classList.toggle("hidden", !ok);
      if (ok) visible++;
      p.innerHTML = i >= 0 ? esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length)) : esc(text);
    });
    $("#transcriptEmpty").classList.toggle("hidden", visible > 0);
  });

  /* ---------- Enregistrer, partager, notifications ---------- */
  $("#podSave").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const on = btn.classList.toggle("is-on");
    $(".material-symbols-outlined", btn).textContent = on ? "bookmark_added" : "bookmark_add";
    $("span:last-child", btn).textContent = on ? "Enregistré" : "Enregistrer";
  });
  $("#podShare").addEventListener("click", async () => {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); toast("Lien de l'épisode copié !"); }
    } catch (e) { /* partage annulé */ }
  });
  $("#podNotify").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const on = btn.classList.toggle("is-on");
    $("span:last-child", btn).textContent = on ? "Notifications activées" : "S'abonner aux notifications";
    toast(on ? "Vous serez prévenu à chaque nouvel épisode de Creative Talks." : "Notifications désactivées.");
  });

  /* ---------- Commentaires ---------- */
  const list = $("#podComments");
  let total = 84;
  const updateTotal = () => $$("[data-comment-total]").forEach((n) => (n.textContent = total));
  list.addEventListener("click", (e) => {
    const like = e.target.closest(".comment-like");
    if (like) {
      const on = like.classList.toggle("is-on");
      const n = $(".tnum", like);
      n.textContent = +n.textContent + (on ? 1 : -1);
    }
    if (e.target.closest(".comment-reply")) {
      const author = $(".text-title-sm", e.target.closest(".comment")).textContent;
      const box = $("#podCommentText");
      box.value = "@" + author + " ";
      box.focus();
    }
  });
  $("#podCommentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const box = $("#podCommentText");
    const text = box.value.trim();
    if (text.length < 10) return;
    const el = document.createElement("div");
    el.className = "comment is-new";
    el.innerHTML = `
      <div class="flex items-center gap-space-sm">
        <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">Vous</div>
        <div class="flex-1 flex flex-wrap items-center justify-between gap-1">
          <span class="flex items-center gap-2"><span class="text-title-sm text-white">Vous</span><span class="text-label-badge px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">En attente de modération</span></span>
          <span class="text-label-meta text-on-surface-variant">À l'instant</span>
        </div>
      </div>
      <p class="comment-text"></p>
      <div class="comment-actions"><button class="comment-like"><span class="material-symbols-outlined text-[16px]">thumb_up</span><span class="tnum">0</span></button></div>`;
    $(".comment-text", el).textContent = text; // texte inséré sans interprétation HTML
    list.prepend(el);
    box.value = "";
    total++;
    updateTotal();
  });

  render();
})();
