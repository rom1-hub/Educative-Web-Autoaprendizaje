(function (root) {
  "use strict";

  // El h aspirado bloquea la elisión; esta lista es léxica, no una regla por letra.
  const H_ASPIREE_VERBS = new Set([
    "hacher", "hachurer", "haïr", "haler", "hâler", "haleter",
    "hanter", "happer", "harceler", "haranguer", "harasser",
    "hasarder", "hausser", "heurter", "hisser", "hocher",
    "hâter", "hennir", "humer", "hurler", "houspiller"
  ]);

  function startsWithElidableVowel(form, lemma) {
    const text = String(form || "").trim();
    if (/^[aeiouyàâäéèêëîïôöùûüÿœ]/i.test(text)) return true;
    if (!/^h/i.test(text)) return false;

    const normalizedLemma = String(lemma || "")
      .trim()
      .toLocaleLowerCase("fr")
      .replace(/[’]/g, "'")
      .replace(/^(?:se\s+|s')/, "");
    return !H_ASPIREE_VERBS.has(normalizedLemma);
  }

  const api = { startsWithElidableVowel, H_ASPIREE_VERBS };
  root.COQ_FRENCH_ORTHOGRAPHY = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
