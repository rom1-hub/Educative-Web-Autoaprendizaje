"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const context = { window: {} };

for (const relativePath of [
  "data/verbs/local-database.js",
  "data/verbs/pronominal-database.js",
  "js/conjugation-lookup.js"
]) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  vm.runInNewContext(source, context, { filename: relativePath });
}

const verbs = context.window.COQ_VERBS;
const pronominalVerbs = context.window.COQ_PRONOMINAL_VERBS;
const engine = context.window.COQ_LOOKUP_ENGINE;
const compoundTenses = [
  "passe-compose",
  "plus-que-parfait",
  "passe-anterieur",
  "futur-anterieur",
  "conditionnel-passe",
  "subjonctif-passe",
  "subjonctif-plus-que-parfait"
];

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase("fr").replace(/[’]/g, "'");
}

function findBase(infinitive) {
  const wanted = normalize(infinitive);
  return Object.values(verbs).find(verb =>
    [verb.infinitif, verb.infinitive, verb.lemma, verb.verb]
      .some(value => normalize(value) === wanted)
  );
}

function findPronominal(infinitive) {
  return Object.values(pronominalVerbs).find(verb =>
    normalize(verb.infinitif) === normalize(infinitive)
  );
}

function conjugatePronominal(infinitive, tense) {
  const specific = findPronominal(infinitive);
  assert.ok(specific, `Falta el registro pronominal: ${infinitive}`);
  const base = findBase(specific.formeNonPronominale || specific.infinitifBase);
  assert.ok(base, `Falta el verbo base de ${infinitive}`);
  return engine.conjugate({ ...base, ...specific, pronominal: true }, tense);
}

test("la base pronominal contiene 102 registros y las excepciones definidas", () => {
  assert.equal(Object.keys(pronominalVerbs).length, 102);
  assert.equal(findPronominal("se parler").accordParticipePasse, "aucun");
  assert.equal(findPronominal("se téléphoner").accordParticipePasse, "aucun");
  assert.equal(findPronominal("s'enfuir").participePasse, "enfui");
  assert.equal(findPronominal("s'absenter").participePasse, "absenté");
});

test("se laver aplica la concordancia en los siete tiempos compuestos", () => {
  const participleEndings = {
    je: "lavé(e)",
    tu: "lavé(e)",
    il: "lavé",
    elle: "lavée",
    on: "lavé(e)(s)",
    nous: "lavé(e)s",
    vous: "lavé(e)(s)",
    ils: "lavés",
    elles: "lavées"
  };

  for (const tense of compoundTenses) {
    const rows = conjugatePronominal("se laver", tense);
    assert.equal(rows.length, 9, `${tense}: deben existir nueve sujetos`);
    const byPerson = Object.fromEntries(rows.map(row => [row.person, row.form]));
    for (const [person, ending] of Object.entries(participleEndings)) {
      assert.ok(
        byPerson[person].endsWith(ending),
        `${tense}, ${person}: se esperaba la terminación ${ending}, se obtuvo ${byPerson[person]}`
      );
    }

    if (tense === "passe-compose") {
      assert.equal(byPerson.je, "me suis lavé(e)");
      assert.equal(byPerson.tu, "t'es lavé(e)");
      assert.equal(byPerson.il, "s'est lavé");
      assert.equal(byPerson.elle, "s'est lavée");
      assert.equal(byPerson.on, "s'est lavé(e)(s)");
      assert.equal(byPerson.nous, "nous sommes lavé(e)s");
      assert.equal(byPerson.vous, "vous êtes lavé(e)(s)");
      assert.equal(byPerson.ils, "se sont lavés");
      assert.equal(byPerson.elles, "se sont lavées");
    }
  }
});

test("se parler y se téléphoner mantienen el participio invariable en todos los tiempos compuestos", () => {
  for (const infinitive of ["se parler", "se téléphoner"]) {
    for (const tense of compoundTenses) {
      const rows = conjugatePronominal(infinitive, tense);
      assert.equal(rows.length, 9);
      for (const row of rows) {
        assert.match(row.form, / parlé$| téléphoné$/);
        assert.doesNotMatch(row.form, /parlée|parlés|parlées|téléphonée|téléphonés|téléphonées/);
      }
    }
  }
});

test("s'enfuir y s'absenter usan los participios acordados", () => {
  const enfuir = Object.fromEntries(conjugatePronominal("s'enfuir", "passe-compose").map(row => [row.person, row.form]));
  assert.equal(enfuir.elle, "s'est enfuie");
  assert.equal(enfuir.ils, "se sont enfuis");

  const absenter = Object.fromEntries(conjugatePronominal("s'absenter", "passe-compose").map(row => [row.person, row.form]));
  assert.equal(absenter.elle, "s'est absentée");
  assert.equal(absenter.ils, "se sont absentés");
});

test("los verbos no pronominales con être también mantienen la concordancia", () => {
  const aller = findBase("aller");
  assert.ok(aller);
  const rows = engine.conjugate(aller, "passe-compose");
  assert.ok(rows);
  const byPerson = Object.fromEntries(rows.map(row => [row.person, row.form]));
  assert.equal(byPerson.elle, "est allée");
  assert.equal(byPerson.ils, "sont allés");
});
