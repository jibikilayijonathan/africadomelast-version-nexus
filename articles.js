/* =========================================================
   AFRICADÔME — page Article (grand format)
   Progression de lecture, sommaire actif, lecture vocale, partage,
   podcast, infographie, j'aime, commentaires
   ========================================================= */

(function articlePage() {
  /* ---------- Barre de progression de lecture ---------- */
  const progress = $("#readingProgress");
  function updateProgress() {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    progress.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Sommaire : chapitre en cours surligné ---------- */
  const tocLinks = $$("#toc .toc-link");
  const sections = tocLinks.map((a) => $(a.getAttribute("href")));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach((s) => s && io.observe(s));
  }

  /* ---------- Écouter l'article (synthèse vocale du navigateur) ---------- */
  const listenBtn = $("#listenBtn");
  const listenState = $("#listenState");
  const listenIcon = $(".material-symbols-outlined", listenBtn);
  const synth = window.speechSynthesis;
  let speaking = false;

  function setListening(on, label) {
    speaking = on;
    listenBtn.setAttribute("aria-pressed", on);
    listenIcon.textContent = on ? "pause" : "volume_up";
    listenState.textContent = label || (on ? "Lecture en cours…" : "Lecture vocale (≈ 8 min)");
    listenState.classList.toggle("animate-pulse", on);
  }

  listenBtn.addEventListener("click", () => {
    if (!synth) { setListening(false, "Non disponible sur ce navigateur"); return; }
    if (speaking) { synth.cancel(); setListening(false); return; }
    const text = [$("h1").textContent, ...$$("#articleBody h2, #articleBody .article-p, #articleBody blockquote").map((el) => el.textContent)]
      .join(". ").replace(/\s+/g, " ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = 1;
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith("fr"));
    if (voice) utter.voice = voice;
    utter.onend = () => setListening(false);
    utter.onerror = () => setListening(false);
    synth.cancel();
    synth.speak(utter);
    setListening(true);
  });
  window.addEventListener("beforeunload", () => synth && synth.cancel());

  /* ---------- Partage ---------- */
  const url = encodeURIComponent(location.href);
  const title = encodeURIComponent(document.title);
  const shareUrls = {
    x: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
  };
  $$("[data-share]").forEach((a) => (a.href = shareUrls[a.dataset.share]));

  $("#copyLink").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      $("#copyMsg").classList.remove("hidden");
      setTimeout(() => $("#copyMsg").classList.add("hidden"), 2000);
    } catch (_) { /* presse-papiers indisponible */ }
  });

  /* ---------- Infographie : barres animées à l'apparition ---------- */
  const bars = $$(".hub-bar > span");
  const fill = () => bars.forEach((b) => (b.style.width = b.dataset.w + "%"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { fill(); obs.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(bars[0].closest(".space-y-3"));
  } else fill();

  /* ---------- Podcast intégré (progression simulée) ---------- */
  const wave = $("#podWave");
  const HEIGHTS = [3, 5, 2, 6, 4, 5, 3, 5, 2, 4, 3, 1, 4, 6, 3, 5, 2, 4, 5, 3, 2, 4, 6, 3];
  const waveBars = HEIGHTS.map((h) => {
    const i = document.createElement("i");
    i.style.height = `${h * 4}px`;
    wave.appendChild(i);
    return i;
  });
  const TOTAL = 28 * 60 + 40;
  let pos = 4 * 60 + 12;
  let podTimer = null;
  const podBtn = $("#podPlay");
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  function renderPod() {
    $("#podTime").textContent = fmt(pos);
    const done = Math.round((pos / TOTAL) * waveBars.length);
    waveBars.forEach((b, i) => b.classList.toggle("is-past", i < done));
  }
  podBtn.addEventListener("click", () => {
    const icon = $(".material-symbols-outlined", podBtn);
    if (podTimer) {
      clearInterval(podTimer); podTimer = null; icon.textContent = "play_arrow";
      podBtn.setAttribute("aria-label", "Écouter le podcast");
    } else {
      podTimer = setInterval(() => { pos = Math.min(pos + 1, TOTAL); renderPod(); }, 1000);
      icon.textContent = "pause";
      podBtn.setAttribute("aria-label", "Mettre le podcast en pause");
    }
  });
  renderPod();

  /* ---------- J'aime & suivre l'autrice ---------- */
  const likeBtn = $("#likeBtn");
  let likes = 1420;
  likeBtn.addEventListener("click", () => {
    const on = !likeBtn.classList.contains("is-on");
    likeBtn.classList.toggle("is-on", on);
    likeBtn.setAttribute("aria-pressed", on);
    likes += on ? 1 : -1;
    $("#likeCount").textContent = likes.toLocaleString("fr-FR");
  });

  const followBtn = $("#followBtn");
  followBtn.addEventListener("click", () => {
    const on = followBtn.getAttribute("aria-pressed") !== "true";
    followBtn.setAttribute("aria-pressed", on);
    $(".material-symbols-outlined", followBtn).textContent = on ? "how_to_reg" : "person_add";
    $("span:last-child", followBtn).textContent = on ? "Abonné(e)" : "Suivre l'autrice";
  });

  /* ---------- Lettre créative ---------- */
  $("#letterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    $("#letterMsg").textContent = "Merci ! Votre inscription est enregistrée.";
    $("#letterMsg").classList.add("text-secondary");
  });

  /* ---------- Commentaires ---------- */
  const list = $("#commentList");
  let total = 86;
  let order = 10;

  function bindLike(btn) {
    btn.addEventListener("click", () => {
      const on = !btn.classList.contains("is-on");
      btn.classList.toggle("is-on", on);
      const count = $(".tnum", btn);
      const comment = btn.closest(".comment");
      comment.dataset.likes = +comment.dataset.likes + (on ? 1 : -1);
      count.textContent = comment.dataset.likes;
    });
  }
  function bindReply(btn) {
    btn.addEventListener("click", () => {
      const name = $(".text-title-sm", btn.closest(".comment")).textContent;
      const ta = $("#commentText");
      ta.value = `@${name} `;
      ta.focus();
    });
  }
  $$(".comment-like", list).forEach(bindLike);
  $$(".comment-reply", list).forEach(bindReply);

  $("#commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#commentText").value.trim();
    if (text.length < 10) return;
    const el = document.createElement("div");
    el.className = "comment is-new";
    el.dataset.likes = "0";
    el.dataset.order = String(++order);
    el.dataset.verified = "0";
    el.innerHTML = `
      <div class="flex items-center gap-space-sm">
        <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-title-sm shrink-0">Vous</div>
        <div>
          <div class="flex flex-wrap items-center gap-1.5"><span class="text-title-sm text-white">Vous</span><span class="bg-surface-container-high text-on-surface-variant text-[10px] font-extrabold px-1.5 py-0.5 rounded">En attente de modération</span></div>
          <span class="text-label-meta text-on-surface-variant">À l'instant</span>
        </div>
      </div>
      <p class="comment-text"></p>
      <div class="comment-actions"><button class="comment-like"><span class="material-symbols-outlined text-[16px]">thumb_up</span><span class="tnum">0</span></button><button class="comment-reply"><span class="material-symbols-outlined text-[16px]">reply</span>Répondre</button></div>`;
    $(".comment-text", el).textContent = text; // texte inséré sans interprétation HTML
    list.prepend(el);
    bindLike($(".comment-like", el));
    bindReply($(".comment-reply", el));
    e.target.reset();
    total++;
    $$("[data-comment-total]").forEach((n) => (n.textContent = total));
  });

  $("#commentSort").addEventListener("change", (e) => {
    const items = $$(".comment", list);
    const by = {
      pertinence: (a, b) => b.dataset.likes - a.dataset.likes,
      recent: (a, b) => b.dataset.order - a.dataset.order,
      verifie: (a, b) => b.dataset.verified - a.dataset.verified || b.dataset.likes - a.dataset.likes,
    }[e.target.value];
    items.sort(by).forEach((c) => list.appendChild(c));
  });

  $("#moreComments").addEventListener("click", () => $("#moreMsg").classList.remove("hidden"));
})();
