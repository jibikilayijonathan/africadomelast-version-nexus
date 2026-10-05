/* =========================================================
   AFRICADÔME — traduction de l'interface (FR / EN / PT / SW / ZH)
   Le site est rédigé en français. Pour une autre langue, ce script
   charge i18n-<langue>.js (dictionnaire « texte français → traduction »)
   et remplace les textes de la page, y compris ceux ajoutés plus tard
   par les scripts (cartes, notifications, lecteur…).
   Langue choisie : ?lang=en dans l'URL, puis mémorisée dans le navigateur.
   ========================================================= */

(function () {
  const LANGS = ["fr", "en", "pt", "sw", "zh"];
  const KEY = "africadome-lang";
  let lang = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
  try {
    if (LANGS.includes(lang)) localStorage.setItem(KEY, lang);
    else lang = localStorage.getItem(KEY) || "fr";
  } catch (e) {
    if (!LANGS.includes(lang)) lang = "fr";
  }
  if (!LANGS.includes(lang)) lang = "fr";
  window.AFD_LANG = lang;
  window.AFD_SPEECH_LANG = { fr: "fr-FR", en: "en-GB", pt: "pt-PT", sw: "sw-KE", zh: "zh-CN" }[lang];

  // Changement de langue : mémorise puis recharge la page
  window.setLanguage = function (next) {
    next = String(next).toLowerCase();
    if (!LANGS.includes(next)) return;
    try { localStorage.setItem(KEY, next); } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    if (next !== "fr") url.searchParams.set("lang", next);
    location.href = url.toString();
  };

  if (lang === "fr") return;
  document.documentElement.lang = lang;
  document.documentElement.classList.add("i18n-pending");
  // Chargement synchrone du dictionnaire (évite d'afficher le français avant la traduction)
  document.write('<script src="i18n-' + lang + '.js"><\/script>');

  const ATTRS = ["placeholder", "aria-label", "title", "alt", "data-soon"];
  const done = new WeakMap(); // nœud texte → dernière valeur traduite (évite les boucles)

  function lookup(text) {
    const pack = window.AFD_I18N;
    if (!pack) return null;
    const key = text.replace(/\s+/g, " ").trim();
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(pack.dict, key)) return pack.dict[key];
    // Ponctuation ou tiret autour d'un texte connu (« — description », « Texte : »)
    const m = key.match(/^([\s—–•·:(«"-]*)([\s\S]*?)([\s:.,;!?…)»"]*)$/);
    if (m && m[1] && Object.prototype.hasOwnProperty.call(pack.dict, m[2] + m[3])) return m[1] + pack.dict[m[2] + m[3]];
    if (m && m[2] && m[2] !== key && Object.prototype.hasOwnProperty.call(pack.dict, m[2])) return m[1] + pack.dict[m[2]] + m[3];
    // Phrases avec une partie variable (« Regarder : <titre> »…)
    for (const [re, tpl] of pack.patterns) {
      const r = key.match(re);
      if (r) return tpl.replace(/\$(\d)/g, (_, i) => lookup(r[i]) ?? r[i]);
    }
    return null;
  }

  function translateText(node) {
    const v = node.nodeValue;
    if (done.get(node) === v) return;
    const t = lookup(v);
    if (t !== null) {
      const out = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
      done.set(node, out);
      if (out !== v) node.nodeValue = out;
    } else done.set(node, v);
  }

  function translateAttrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const t = lookup(v);
      if (t !== null && t !== v) el.setAttribute(a, t);
    }
  }

  const skip = (el) => el && el.closest("script, style, .material-symbols-outlined, [data-no-i18n]");

  function translateTree(root) {
    if (root.nodeType === 3) {
      if (!skip(root.parentElement)) translateText(root);
      return;
    }
    if (root.nodeType !== 1 || skip(root)) return;
    translateAttrs(root);
    root.querySelectorAll("[placeholder], [aria-label], [title], [alt], [data-soon]").forEach(translateAttrs);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (skip(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    let n;
    while ((n = walker.nextNode())) translateText(n);
  }

  function start() {
    try {
      if (window.AFD_I18N) {
        const t = lookup(document.title);
        if (t) document.title = t;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) { const d = lookup(meta.content); if (d) meta.content = d; }
        translateTree(document.body);
        new MutationObserver((list) => {
          for (const m of list) {
            if (m.type === "characterData") { if (!skip(m.target.parentElement)) translateText(m.target); }
            else if (m.type === "attributes") translateAttrs(m.target);
            else m.addedNodes.forEach(translateTree);
          }
        }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      }
    } finally {
      document.documentElement.classList.remove("i18n-pending");
    }
  }
  document.addEventListener("DOMContentLoaded", start);
  // Sécurité : ne jamais laisser la page masquée
  setTimeout(() => document.documentElement.classList.remove("i18n-pending"), 3000);
})();
