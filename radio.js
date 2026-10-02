/* =========================================================
   AFRICADÔME — page Radio
   Lecteur du direct, changement de webradio, podcasts, auditeurs
   ========================================================= */

// URL du flux audio (laisser vide pour une simulation visuelle)
const RADIO_STREAM_URL = "";

(function radioPage() {
  /* ---------- Égaliseur du direct ---------- */
  const eq = $("#liveEq");
  const COLORS = ["#4edea3", "#4edea3", "#f59e0b", "#ffc174", "#f59e0b", "#ffc174", "#4edea3", "#ffb4ab"];
  const bars = Array.from({ length: 28 }, (_, i) => {
    const bar = document.createElement("i");
    bar.style.background = COLORS[i % COLORS.length];
    eq.appendChild(bar);
    return bar;
  });

  let playing = true;
  let raf;
  let last = 0;
  function animate(ts) {
    if (ts - last > 120) {
      bars.forEach((b) => (b.style.height = `${20 + Math.random() * 80}%`));
      last = ts;
    }
    raf = requestAnimationFrame(animate);
  }

  /* ---------- Lecture / pause ---------- */
  const audio = new Audio();
  audio.preload = "none";
  const playBtn = $("#masterPlay");
  const playIcon = $(".material-symbols-outlined", playBtn);
  const playState = $("#playState");

  function setPlaying(state) {
    playing = state;
    playIcon.textContent = playing ? "pause" : "play_arrow";
    playBtn.setAttribute("aria-label", playing ? "Mettre en pause" : "Écouter le direct");
    playState.innerHTML = playing
      ? '<span class="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>Diffusion continue sans interruption'
      : '<span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>En pause — cliquez pour reprendre le direct';
    playState.classList.toggle("text-secondary", playing);
    playState.classList.toggle("text-on-surface-variant", !playing);
    cancelAnimationFrame(raf);
    if (playing) {
      raf = requestAnimationFrame(animate);
      if (RADIO_STREAM_URL) {
        if (!audio.src) audio.src = RADIO_STREAM_URL;
        audio.play().catch(() => {});
      }
    } else {
      bars.forEach((b) => (b.style.height = "15%"));
      audio.pause();
    }
  }
  playBtn.addEventListener("click", () => setPlaying(!playing));
  setPlaying(true);

  /* ---------- Volume ---------- */
  const volume = $("#volume");
  volume.addEventListener("input", () => {
    const v = +volume.value;
    audio.volume = v / 100;
    $("#volIcon").textContent = v === 0 ? "volume_off" : v < 50 ? "volume_down" : "volume_up";
  });

  /* ---------- Webradios thématiques ---------- */
  $$(".webradio").forEach((card) => {
    $(".webradio-play", card).addEventListener("click", () => {
      $$(".webradio").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      const d = card.dataset;
      $("#liveTitle").textContent = d.title;
      $("#liveCategory").textContent = d.cat;
      $("#liveSlot").textContent = d.slot;
      $("#liveDesc").innerHTML = `Avec <span class="text-white font-medium">${d.host}</span> — ${d.desc}`;
      $("#trackTitle").textContent = d.track;
      $("#trackAlbum").textContent = d.album;
      setPlaying(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ---------- Podcasts : filtres & lecture ---------- */
  $$("#podcastChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const cat = chip.dataset.cat;
      $$("#podcastGrid .podcast-card").forEach((card) =>
        card.classList.toggle("is-hidden", !!cat && card.dataset.cat !== cat)
      );
    })
  );
  $$(".listen-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const on = !btn.classList.contains("is-playing");
      $$(".listen-btn").forEach((b) => {
        b.classList.remove("is-playing");
        $(".material-symbols-outlined", b).textContent = "play_arrow";
        $("span:last-child", b).textContent = "Écouter";
      });
      if (on) {
        btn.classList.add("is-playing");
        $(".material-symbols-outlined", btn).textContent = "pause";
        $("span:last-child", btn).textContent = "En lecture";
        setPlaying(false); // un seul flux audio à la fois
      }
    })
  );

  /* ---------- Compteur d'auditeurs ---------- */
  const listeners = $("#listeners");
  let count = 14820;
  setInterval(() => {
    count = Math.max(14800, count + Math.floor(Math.random() * 7) - 3);
    listeners.textContent = count.toLocaleString("fr-FR");
  }, 4000);

  /* ---------- Partage du direct ---------- */
  $("#shareLive").addEventListener("click", async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Africadôme Radio — en direct", url: location.href });
      else await navigator.clipboard.writeText(location.href);
    } catch (_) { /* partage annulé */ }
  });
})();
