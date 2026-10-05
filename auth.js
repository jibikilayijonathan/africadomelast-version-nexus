/* =========================================================
   AFRICADÔME — pages Connexion & Inscription
   Validation des champs, affichage du mot de passe, force du
   mot de passe, choix du profil, envoi simulé.
   Démonstration : aucune donnée n'est envoyée ni stockée.
   À relier à votre service d'authentification.
   ========================================================= */

(function authPages() {
  /* ---------- Afficher / masquer le mot de passe ---------- */
  $$(".pwd-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const input = $("#" + btn.dataset.pwd);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      $(".material-symbols-outlined", btn).textContent = show ? "visibility_off" : "visibility";
      btn.setAttribute("aria-label", show ? "Masquer le mot de passe" : "Afficher le mot de passe");
    })
  );

  /* ---------- Validation ---------- */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  function check(input) {
    let ok;
    if (input.type === "checkbox") ok = input.checked;
    else if (input.type === "email") ok = isEmail(input.value.trim());
    else if (input.minLength > 0) ok = input.value.length >= input.minLength;
    else ok = input.value.trim() !== "";
    const err = $(`[data-error-for="${input.id}"]`);
    if (err) err.classList.toggle("hidden", ok);
    const field = input.closest(".auth-field");
    if (field) field.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", !ok);
    return ok;
  }
  function validate(form) {
    const fields = $$("input[required], select[required]", form);
    const results = fields.map(check);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  $$("input[required], select[required]").forEach((input) =>
    input.addEventListener(input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "blur", () => {
      if (input.getAttribute("aria-invalid") !== null || input.value) check(input);
    })
  );

  /* ---------- Envoi simulé ---------- */
  function fakeSubmit(form, btn, msg, doneText, doneMsg) {
    if (!validate(form)) return;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="auth-spinner" aria-hidden="true"></span><span>Vérification en cours…</span>';
    setTimeout(() => {
      btn.classList.add("is-done");
      btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>' + doneText + "</span>";
      msg.textContent = doneMsg;
      msg.classList.remove("hidden");
      $$(".pwd-toggle", form).forEach((t) => ($("#" + t.dataset.pwd).value = "")); // rien n'est conservé
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove("is-done");
        btn.innerHTML = original;
      }, 4000);
    }, 1200);
  }

  const login = $("#loginForm");
  if (login) {
    login.addEventListener("submit", (e) => {
      e.preventDefault();
      fakeSubmit(login, $("#loginSubmit"), $("#loginMsg"), "Connexion réussie",
        "Démonstration : la connexion sera active une fois le site relié à votre service de comptes.");
    });
  }

  /* ---------- Inscription : profil & force du mot de passe ---------- */
  const signup = $("#signupForm");
  if (signup) {
    const pills = $$("#roleSelector .role-pill");
    let role = "createur";
    pills.forEach((pill) =>
      pill.addEventListener("click", () => {
        role = pill.dataset.role;
        pills.forEach((p) => {
          const on = p === pill;
          p.classList.toggle("is-active", on);
          p.setAttribute("aria-checked", on);
        });
      })
    );

    const bars = $$("#pwdBars i");
    const label = $("#pwdStrengthLabel");
    $("#suPassword").addEventListener("input", (e) => {
      const v = e.target.value;
      const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
      let level = 0;
      if (v.length >= 1) level = 1;
      if (v.length >= 8 && variety >= 2) level = 2;
      if (v.length >= 10 && variety >= 3) level = 3;
      const TEXT = ["8 caractères minimum", "Trop court ou trop simple", "Moyen : ajoutez chiffres et symboles", "Excellent mot de passe"];
      const CLS = ["", "is-weak", "is-medium", "is-strong"];
      label.textContent = TEXT[level];
      label.className = "text-label-meta pwd-label " + CLS[level];
      bars.forEach((b, i) => (b.className = i < level ? CLS[level] : ""));
    });

    signup.addEventListener("submit", (e) => {
      e.preventDefault();
      signup.dataset.role = role; // profil choisi, à transmettre au service de comptes
      fakeSubmit(signup, $("#signupSubmit"), $("#signupMsg"), "Bienvenue sur Africadôme !",
        "Démonstration : votre compte sera créé une fois le site relié à votre service de comptes.");
    });
  }
})();
