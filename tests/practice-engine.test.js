"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const subjects = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
const verbs = {
  parler: {
    infinitif: "parler", groupe: 1, auxiliaire: "avoir",
    formes: { "présent de l'indicatif": ["parle", "parles", "parle", "parlons", "parlez", "parlent"] }
  },
  finir: {
    infinitif: "finir", groupe: 2, auxiliaire: "avoir",
    formes: { "présent de l'indicatif": ["finis", "finis", "finit", "finissons", "finissez", "finissent"] }
  },
  aller: {
    infinitif: "aller", groupe: 3, auxiliaire: "être",
    formes: { "présent de l'indicatif": ["vais", "vas", "va", "allons", "allez", "vont"] }
  },
  manger: {
    infinitif: "manger", groupe: 1, auxiliaire: "avoir",
    formes: { "présent de l'indicatif": ["mange", "manges", "mange", "mangeons", "mangez", "mangent"] }
  },
  préférer: {
    infinitif: "préférer", groupe: 1, auxiliaire: "avoir",
    formes: { "présent de l'indicatif": ["préfère", "préfères", "préfère", "préférons", "préférez", "préfèrent"] }
  },
  laver: {
    infinitif: "laver", groupe: 1, auxiliaire: "avoir",
    formes: { "présent de l'indicatif": ["lave", "laves", "lave", "lavons", "lavez", "lavent"] }
  }
};
const pronominal = {
  "se-laver": {
    infinitif: "se laver", infinitifBase: "laver", formeNonPronominale: "laver",
    auxiliaire: "être", accordParticipePasse: "sujet"
  }
};

function mockConjugate(verb, tense) {
  if (tense !== "present") return null;
  if (verb.pronominal) {
    const forms = ["me lave", "te laves", "se lave", "se lave", "se lave", "nous lavons", "vous lavez", "se lavent", "se lavent"];
    return subjects.map((person, index) => ({ person, form: forms[index] }));
  }
  const record = verbs[verb.infinitif];
  if (!record) return null;
  const forms = record.formes["présent de l'indicatif"];
  return subjects.map((person, index) => {
    const value = forms[Math.min(index, 5)];
    return { person, form: value };
  });
}

const context = {
  window: {
    COQ_VERBS: verbs,
    COQ_IMPERSONAL_VERBS: {},
    COQ_PRONOMINAL_VERBS: pronominal,
    COQ_LOOKUP_ENGINE: { conjugate: mockConjugate }
  }
};
vm.runInNewContext(
  fs.readFileSync(path.join(root, "js/conjugation-practice.js"), "utf8"),
  context,
  { filename: "js/conjugation-practice.js" }
);
const engine = context.window.COQ_PRACTICE_ENGINE;

function makeTarget() {
  const submitButton = { textContent: "", focus() {} };
  const input = { disabled: false, value: "", focus() {} };
  const form = {
    addEventListener() {},
    querySelector() { return submitButton; }
  };
  const feedback = { hidden: true, className: "", innerHTML: "" };
  return {
    innerHTML: "",
    querySelector(selector) {
      if (selector === "[data-practice-answer-form]") return form;
      if (selector === "#practice-answer") return input;
      if (selector === "[data-practice-feedback]") return feedback;
      return null;
    }
  };
}

test("la normalización acepta respuestas sin acentos ni diferencias de mayúsculas", () => {
  assert.equal(engine.answerIsCorrect("PREFERE", "préfère"), true);
  assert.equal(engine.answerIsCorrect("me suis lavee", "me suis lavé(e)"), true);
  assert.equal(engine.answerIsCorrect("  NOUS LAVONS  ", "nous lavons"), true);
  assert.equal(engine.answerIsCorrect("", "parle"), false);
});

test("la sesión genera veinte ejercicios y conserva la forma canónica del verbo", () => {
  const target = makeTarget();
  engine.start({ verb: "parler", tense: "present" }, target);
  assert.match(target.innerHTML, /Ejercicio 1 de 20/);
  assert.match(target.innerHTML, /parler/);
  assert.match(target.innerHTML, /Présent de l'indicatif/);
});

test("el filtro pronominal permite buscar por infinitivo base y muestra la forma pronominal", () => {
  const target = makeTarget();
  engine.start({ verb: "laver", tense: "present", construction: "pronominal" }, target);
  assert.match(target.innerHTML, /Ejercicio 1 de 20/);
  assert.match(target.innerHTML, /se laver/);
});

test("un infinitivo inexistente produce un mensaje y no inicia preguntas", () => {
  const target = makeTarget();
  engine.start({ verb: "inexistir", tense: "present" }, target);
  assert.match(target.innerHTML, /No se encontraron verbos/);
  assert.doesNotMatch(target.innerHTML, /Ejercicio 1 de 20/);
});

test("el filtro por familia distingue verbos en -GER", () => {
  const target = makeTarget();
  engine.start({ verb: "manger", tense: "present", family: "ger" }, target);
  assert.match(target.innerHTML, /Ejercicio 1 de 20/);
  assert.match(target.innerHTML, /manger/);
});
