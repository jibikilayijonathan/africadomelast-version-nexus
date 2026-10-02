/* =========================================================
   AFRICADÔME — page d'accueil
   ========================================================= */

// URL du flux audio de la radio (laisser vide pour une simulation visuelle)
const RADIO_STREAM_URL = "";

// Les helpers $ / $$ et la logique d'en-tête sont dans site.js (chargé avant ce fichier).

/* ---------- Carrousel "À la une" ---------- */
(function heroSlider() {
  const hero = $("#hero");
  const slides = $$(".hero-slide", hero);
  const dotsWrap = $("#heroDots");
  let index = 0;
  let timer;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Diapositive ${i + 1}`);
    dot.addEventListener("click", () => { go(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function go(i) {
    slides[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");
    index = (i + slides.length) % slides.length;
    slides[index].classList.add("is-active");
    dots[index].classList.add("is-active");
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 7000);
  }

  $("#heroPrev").addEventListener("click", () => { go(index - 1); restart(); });
  $("#heroNext").addEventListener("click", () => { go(index + 1); restart(); });

  let startX = 0;
  hero.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  hero.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", restart);

  dots[0].classList.add("is-active");
  restart();
})();

/* ---------- Radio : forme d'onde, lecture, stations ---------- */
(function radio() {
  const wave = $("#waveform");
  const BARS = 72;
  const bars = [];
  for (let i = 0; i < BARS; i++) {
    const t = i / (BARS - 1);
    const bar = document.createElement("i");
    // dégradé vert -> ambre -> rouge, comme sur la maquette
    const hue = 155 - t * 155;
    bar.style.background = `hsl(${hue}, 75%, 52%)`;
    bar.style.height = `${18 + Math.abs(Math.sin(i * 0.7)) * 55 * (0.4 + t * 0.6)}%`;
    wave.appendChild(bar);
    bars.push(bar);
  }

  const playBtn = $("#radioPlay");
  const playIcon = $(".material-symbols-outlined", playBtn);
  const audio = $("#radioAudio");
  let playing = false;
  let raf;
  let last = 0;

  function animate(ts) {
    if (ts - last > 110) {
      bars.forEach((b, i) => {
        const t = i / (BARS - 1);
        b.style.height = `${Math.min(12 + Math.random() * 88 * (0.35 + t * 0.65), 100)}%`;
      });
      last = ts;
    }
    raf = requestAnimationFrame(animate);
  }

  function setPlaying(state) {
    playing = state;
    playIcon.textContent = playing ? "pause" : "play_arrow";
    playBtn.setAttribute("aria-label", playing ? "Mettre en pause" : "Écouter la radio");
    document.body.classList.toggle("radio-on", playing);
    cancelAnimationFrame(raf);
    if (playing) {
      raf = requestAnimationFrame(animate);
      if (RADIO_STREAM_URL) {
        if (!audio.src) audio.src = RADIO_STREAM_URL;
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }
  playBtn.addEventListener("click", () => setPlaying(!playing));

  $$(".station").forEach((st) =>
    st.addEventListener("click", () => {
      $$(".station").forEach((s) => s.classList.remove("is-active"));
      st.classList.add("is-active");
      $("#nowTitle").textContent = st.dataset.title;
      $("#nowDesc").textContent = st.dataset.desc;
      $("#nowShow").textContent = st.dataset.title;
      setPlaying(true);
      $("#radio").scrollIntoView({ behavior: "smooth", block: "nearest" });
    })
  );
})();

/* ---------- "Pour vous" : cartes + filtres ---------- */
const CONTENTS = [
  { title: "Tenues traditionnelles : entre héritage et modernité", cat: "Culture", color: "bg-secondary-container", time: "06:40", tags: ["pourvous", "mode"], img: "culture-tenues.jpg", pos: "50%" },
  { title: "Comprendre l'IA en 5 minutes (épisode 1)", cat: "Tech & IA", color: "bg-indigo-600", time: "07:15", tags: ["tech", "pourvous"], img: "tech-ia.jpg", pos: "45%" },
  { title: "Vidéastes : le parcours inspirant d'une jeune équipe", cat: "Créateurs", color: "bg-orange-500", time: "05:30", tags: ["createurs", "pourvous"], img: "videastes.jpg", pos: "55%" },
  { title: "Sur scène : la nouvelle vague afro prend le micro", cat: "Musique", color: "bg-orange-600", time: "04:12", tags: ["musique", "pourvous"], img: "chanteur-scene.jpg", pos: "60%" },
  { title: "Entrepreneuriat : ces femmes qui cassent les codes", cat: "Société", color: "bg-rose-600", time: "06:02", tags: ["societe", "cameroun"], img: "marche-cameroun.jpg", pos: "70%" },
  { title: "Docu : la beauté sauvage des baobabs", cat: "Cinéma", color: "bg-sky-600", time: "09:08", tags: ["cinema", "pourvous"], img: "baobab-soleil.jpg", pos: "50%" },
  { title: "Réalité virtuelle : l'artisanat entre dans le futur", cat: "Tech & IA", color: "bg-indigo-600", time: "06:55", tags: ["tech", "createurs"], img: "vr-textile.jpg", pos: "55%" },
  { title: "Denim et attitude : la mode urbaine africaine", cat: "Mode", color: "bg-teal-600", time: "04:58", tags: ["mode", "createurs"], img: "mode-denim.jpg", pos: "60%" },
  { title: "Sur le plateau d'un tournage Nollywood", cat: "Cinéma", color: "bg-sky-600", time: "11:24", tags: ["cinema"], img: "tournage-nollywood.jpg", pos: "55%" },
  { title: "Micro-trottoir : la parole aux marchés", cat: "Podcast", color: "bg-violet-600", time: "24:10", tags: ["podcasts", "societe"], img: "journaliste-micro.jpg", pos: "30%" },
  { title: "Percussions : le rythme qui rassemble", cat: "Musique", color: "bg-orange-600", time: "05:47", tags: ["musique"], img: "percussions.jpg", pos: "40%" },
  { title: "Sur le plateau d'un tournage à Yaoundé", cat: "Cinéma", color: "bg-sky-600", time: "08:12", tags: ["cinema", "cameroun"], img: "cinema-tournage.jpg", pos: "60%" },
  { title: "Podcast : réussir sa levée de fonds créative", cat: "Podcast", color: "bg-violet-600", time: "32:10", tags: ["podcasts", "societe", "cameroun"], img: "entrepreneurs.jpg", pos: "30%" },
  { title: "Le griot moderne : musique et transmission", cat: "Musique", color: "bg-orange-600", time: "07:33", tags: ["musique", "podcasts"], img: "musicien-scene.jpg", pos: "45%" },
  { title: "Beatmakers : les sessions qui font les hits", cat: "Musique", color: "bg-orange-600", time: "08:45", tags: ["musique", "createurs"], img: "studio-musique.jpg", pos: "30%" },
  { title: "Dans l'atelier d'une peintre contemporaine", cat: "Créateurs", color: "bg-orange-500", time: "06:21", tags: ["createurs", "cameroun"], img: "atelier-artiste.jpg", pos: "70%" },
];

const cardsEl = $("#cards");
const prevBtn = $("#cardsPrev");
const nextBtn = $("#cardsNext");
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function renderCards(filter = "all") {
  const list = filter === "all" ? CONTENTS : CONTENTS.filter((c) => c.tags.includes(filter));
  cardsEl.innerHTML = list.length
    ? list.map((c, i) => `
      <a href="#" class="card" style="animation-delay:${i * 0.05}s">
        <div class="card-thumb">
          <img src="${c.img}" alt="" loading="lazy" style="object-position:${c.pos} center">
          <span class="tag ${c.color} absolute top-3 left-3 z-10">${escapeHtml(c.cat)}</span>
          <span class="card-time"><span class="material-symbols-outlined fill text-[14px]">play_arrow</span>${c.time}</span>
        </div>
        <div class="p-4"><p class="card-title">${escapeHtml(c.title)}</p></div>
      </a>`).join("")
    : `<p class="text-on-surface-variant py-12">Aucun contenu dans cette catégorie pour le moment.</p>`;
  cardsEl.scrollLeft = 0;
  updateArrows();
}

function updateArrows() {
  const max = cardsEl.scrollWidth - cardsEl.clientWidth;
  prevBtn.disabled = cardsEl.scrollLeft <= 5;
  nextBtn.disabled = cardsEl.scrollLeft >= max - 5;
}

prevBtn.addEventListener("click", () => cardsEl.scrollBy({ left: -cardsEl.clientWidth * 0.8 }));
nextBtn.addEventListener("click", () => cardsEl.scrollBy({ left: cardsEl.clientWidth * 0.8 }));
cardsEl.addEventListener("scroll", updateArrows, { passive: true });
window.addEventListener("resize", updateArrows);

$$("#chips .chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    $$("#chips .chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderCards(chip.dataset.filter);
  })
);
renderCards();

/* ---------- Compteurs animés ---------- */
(function counters() {
  const els = $$("[data-count]");
  const run = (el) => {
    const target = +el.dataset.count;
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
})();
