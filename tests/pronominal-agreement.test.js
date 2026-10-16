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
  "data/verbs/impersonal-database.js",
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

test("la base pronominal contiene 106 registros y las excepciones definidas", () => {
  assert.equal(Object.keys(pronominalVerbs).length, 106);
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


test("advenir solo muestra il e ils, usa être y no presenta gerundio", () => {
  const advenir = context.window.COQ_IMPERSONAL_VERBS.advenir;
  assert.ok(advenir, "El registro complementario de advenir debe cargarse.");
  assert.equal(advenir.defective, true);
  assert.equal(advenir.typeLabel, "Verbo defectivo");
  assert.equal(advenir.auxiliaire, "être");
  assert.equal(advenir.participePasse, "advenu");
  assert.equal(advenir.participePresent, "advenant");
  assert.equal(advenir.gerondifDisponible, false);

  const expectedSimple = {
    present: [["il", "advient"], ["ils", "adviennent"]],
    imparfait: [["il", "advenait"], ["ils", "advenaient"]],
    "passe-simple": [["il", "advint"], ["ils", "advinrent"]],
    "futur-simple": [["il", "adviendra"], ["ils", "adviendront"]],
    "conditionnel-present": [["il", "adviendrait"], ["ils", "adviendraient"]],
    "subjonctif-present": [["il", "advienne"], ["ils", "adviennent"]],
    "subjonctif-imparfait": [["il", "advînt"], ["ils", "advinssent"]]
  };

  for (const [tense, expected] of Object.entries(expectedSimple)) {
    assert.deepEqual(
      Array.from(engine.conjugate(advenir, tense), row => [row.person, row.form]),
      expected,
      `${tense}: advenir debe mostrar las formas de il e ils`
    );
  }

  const expectedCompounds = {
    "passe-compose": [["il", "est advenu"], ["ils", "sont advenus"]],
    "plus-que-parfait": [["il", "était advenu"], ["ils", "étaient advenus"]],
    "passe-anterieur": [["il", "fut advenu"], ["ils", "furent advenus"]],
    "futur-anterieur": [["il", "sera advenu"], ["ils", "seront advenus"]],
    "conditionnel-passe": [["il", "serait advenu"], ["ils", "seraient advenus"]],
    "subjonctif-passe": [["il", "soit advenu"], ["ils", "soient advenus"]],
    "subjonctif-plus-que-parfait": [["il", "fût advenu"], ["ils", "fussent advenus"]]
  };

  for (const [tense, expected] of Object.entries(expectedCompounds)) {
    assert.deepEqual(
      Array.from(engine.conjugate(advenir, tense), row => [row.person, row.form]),
      expected,
      `${tense}: advenir debe usar être y concordar el participio`
    );
  }

  assert.equal(engine.conjugate(advenir, "imperatif-present"), null);
  assert.equal(engine.conjugate(advenir, "imperatif-passe"), null);
  const all = engine.conjugate(advenir, "all");
  for (const [tense, rows] of Object.entries(all)) {
    assert.deepEqual(Array.from(rows, row => row.person), ["il", "ils"], `${tense}: sujetos permitidos`);
  }
  assert.equal("imperatif-present" in all, false);
  assert.equal("imperatif-passe" in all, false);
});

test("falloir muestra solo il, genera los tiempos compuestos y no ofrece imperativo", () => {
  const falloir = context.window.COQ_IMPERSONAL_VERBS.falloir;
  assert.ok(falloir, "El registro complementario de falloir debe cargarse.");
  assert.equal(falloir.impersonal, true);

  const expectedSimple = {
    present: "faut",
    imparfait: "fallait",
    "passe-simple": "fallut",
    "futur-simple": "faudra",
    "conditionnel-present": "faudrait",
    "subjonctif-present": "faille",
    "subjonctif-imparfait": "fallût"
  };

  for (const [tense, form] of Object.entries(expectedSimple)) {
    assert.deepEqual(
      Array.from(engine.conjugate(falloir, tense), row => [row.person, row.form]),
      [["il", form]],
      `${tense}: falloir debe mostrar únicamente il ${form}`
    );
  }

  const expectedCompounds = {
    "passe-compose": "a fallu",
    "plus-que-parfait": "avait fallu",
    "passe-anterieur": "eut fallu",
    "futur-anterieur": "aura fallu",
    "conditionnel-passe": "aurait fallu",
    "subjonctif-passe": "ait fallu",
    "subjonctif-plus-que-parfait": "eût fallu"
  };

  for (const [tense, form] of Object.entries(expectedCompounds)) {
    assert.deepEqual(
      Array.from(engine.conjugate(falloir, tense), row => [row.person, row.form]),
      [["il", form]],
      `${tense}: se esperaba «il ${form}»`
    );
  }

  assert.equal(engine.conjugate(falloir, "imperatif-present"), null);
  assert.equal(engine.conjugate(falloir, "imperatif-passe"), null);

  const all = engine.conjugate(falloir, "all");
  for (const [tense, rows] of Object.entries(all)) {
    assert.deepEqual(
      Array.from(rows, row => row.person),
      ["il"],
      `${tense}: falloir debe mostrar solo el sujeto il`
    );
  }
  assert.equal("imperatif-present" in all, false);
  assert.equal("imperatif-passe" in all, false);
});

test("pleuvoir solo muestra il e ils y no ofrece formas de imperativo", () => {
  const pleuvoir = context.window.COQ_IMPERSONAL_VERBS.pleuvoir;
  assert.ok(pleuvoir, "El registro complementario de pleuvoir debe cargarse.");

  const present = engine.conjugate(pleuvoir, "present");
  assert.deepEqual(Array.from(present, row => [row.person, row.form]), [
    ["il", "pleut"],
    ["ils", "pleuvent"]
  ]);

  const passeCompose = engine.conjugate(pleuvoir, "passe-compose");
  assert.deepEqual(Array.from(passeCompose, row => [row.person, row.form]), [
    ["il", "a plu"],
    ["ils", "ont plu"]
  ]);

  const subjonctifPasse = engine.conjugate(pleuvoir, "subjonctif-passe");
  assert.deepEqual(Array.from(subjonctifPasse, row => [row.person, row.form]), [
    ["il", "ait plu"],
    ["ils", "aient plu"]
  ]);

  assert.equal(engine.conjugate(pleuvoir, "imperatif-present"), null);
  assert.equal(engine.conjugate(pleuvoir, "imperatif-passe"), null);

  const all = engine.conjugate(pleuvoir, "all");
  for (const [tense, rows] of Object.entries(all)) {
    assert.ok(
      rows.every(row => row.person === "il" || row.person === "ils"),
      `${tense}: pleuvoir no debe mostrar sujetos personales`
    );
  }
  assert.equal("imperatif-present" in all, false);
  assert.equal("imperatif-passe" in all, false);
});
