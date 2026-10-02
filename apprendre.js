/* =========================================================
   AFRICADÔME — page Apprendre (Campus)
   Recherche & niveaux, carrousel, lecteur, simulateur de paiement,
   formulaire de candidature
   ========================================================= */

(function campusPage() {
  /* ---------- Recherche + niveau ---------- */
  const courses = $$("#parcoursTrack .course-card");
  const masterclasses = $$("#mcGrid .mc-card");
  const search = $("#courseSearch");
  let level = "";
  const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function filterGroup(cards) {
    const q = normalize(search.value.trim());
    let visible = 0;
    cards.forEach((card) => {
      const ok =
        (!q || normalize(card.textContent).includes(q)) &&
        (!level || card.dataset.level.split(" ").includes(level));
      card.classList.toggle("is-hidden", !ok);
      if (ok) visible++;
    });
    const empty = cards[0].closest("section").querySelector("[data-empty]");
    empty.classList.toggle("hidden", visible > 0);
  }
  function apply() {
    filterGroup(courses);
    filterGroup(masterclasses);
    $("#parcoursTrack").scrollLeft = 0;
  }
  search.addEventListener("input", apply);
  $("#courseSearchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
    $("#parcours").scrollIntoView({ behavior: "smooth" });
  });
  $$("#levelChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      level = chip.dataset.level;
      apply();
    })
  );

  /* ---------- Carrousel des parcours ---------- */
  const track = $("#parcoursTrack");
  const step = () => track.clientWidth * 0.9;
  $("#parcoursPrev").addEventListener("click", () => track.scrollBy({ left: -step() }));
  $("#parcoursNext").addEventListener("click", () => track.scrollBy({ left: step() }));

  /* ---------- Fenêtres modales (ouverture / fermeture communes) ---------- */
  let lastFocus = null;
  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const first = $("input, select, button[data-close]", modal);
    if (first) first.focus();
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".player").forEach((modal) => {
    $$("[data-close]", modal).forEach((b) => b.addEventListener("click", () => closeModal(modal)));
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modal); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    $$(".player").forEach((m) => { if (!m.hidden) closeModal(m); });
  });

  /* ---------- Lecteur (masterclasses & aperçu) ---------- */
  const player = $("#player");
  function play(el) {
    $("#playerTitle").textContent = el.dataset.title;
    $("#playerImg").src = el.dataset.img;
    openModal(player);
  }
  $$("[data-play]").forEach((el) => {
    el.addEventListener("click", () => play(el));
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "Regarder : " + el.dataset.title);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(el); }
    });
  });

  /* ---------- Simulateur de paiement ---------- */
  const simulator = $("#simulator");
  const simCourse = $("#simCourse");
  let instalments = 3;
  courses.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.dataset.price;
    opt.textContent = c.dataset.name;
    simCourse.appendChild(opt);
  });
  const fcfa = (n) => n.toLocaleString("fr-FR") + " FCFA";
  function renderSim() {
    const total = +simCourse.value;
    const each = Math.ceil(total / instalments / 100) * 100; // arrondi à la centaine
    $("#simTotal").textContent = fcfa(total);
    $("#simEach").textContent = fcfa(each);
    $("#simSchedule").textContent = instalments === 1
      ? "Paiement unique à l'inscription."
      : `${instalments} versements mensuels, le premier à l'inscription.`;
  }
  simCourse.addEventListener("change", renderSim);
  $$("#simInstalments .chip").forEach((chip) =>
    chip.addEventListener("click", () => { instalments = +chip.dataset.n; renderSim(); })
  );
  $("#openSimulator").addEventListener("click", () => { renderSim(); openModal(simulator); });

  /* ---------- Candidature / rendez-vous ---------- */
  const applyModal = $("#applyModal");
  const applyForm = $("#applyForm");
  $$("[data-apply]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".course-card");
      const subject = btn.dataset.subject || (card && card.dataset.name) || "Africadôme Campus";
      $("#applyTitle").textContent = btn.dataset.subject ? "Prendre rendez-vous" : "Candidater au parcours";
      $("#applySubject").textContent = subject;
      applyForm.reset();
      applyForm.classList.remove("hidden");
      $("#applyDone").classList.add("hidden");
      openModal(applyModal);
    })
  );
  applyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    applyForm.classList.add("hidden");
    $("#applyDone").classList.remove("hidden");
  });
})();
