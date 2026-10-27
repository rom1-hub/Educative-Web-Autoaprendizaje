const test = require("node:test");
const assert = require("node:assert/strict");

const { startsWithElidableVowel } = require("../js/french-orthography.js");

test("h muet permite la elisión en formas conjugadas", () => {
  assert.equal(startsWithElidableVowel("habite", "habiter"), true);
  assert.equal(startsWithElidableVowel("hésite", "hésiter"), true);
});

test("h aspiré bloquea la elisión en verbos con h aspirada", () => {
  assert.equal(startsWithElidableVowel("harcèle", "harceler"), false);
  assert.equal(startsWithElidableVowel("hais", "haïr"), false);
  assert.equal(startsWithElidableVowel("hurlons", "hurler"), false);
});

test("la forma pronominal usa el infinitivo base para clasificar la h", () => {
  assert.equal(startsWithElidableVowel("harcèle", "se harceler"), false);
  assert.equal(startsWithElidableVowel("habille", "s'habiller"), true);
});
