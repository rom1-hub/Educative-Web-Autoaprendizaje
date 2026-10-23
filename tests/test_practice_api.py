import unittest

from fastapi import HTTPException

from backend.main import (
    CheckRequest,
    GenerateRequest,
    check_answer,
    generate_practice,
    regular_er_present,
)


class RegularFirstGroupPresentTests(unittest.TestCase):
    def test_parler_present_forms(self):
        forms = regular_er_present("parler")
        self.assertEqual(
            [row["form"] for row in forms],
            ["parle", "parles", "parle", "parle", "parle",
             "parlons", "parlez", "parlent", "parlent"],
        )

    def test_supports_ger_family_spelling_rules(self):
        forms = regular_er_present("manger")
        self.assertEqual([row["form"] for row in forms], ["mange", "manges", "mange", "mange", "mange", "mangeons", "mangez", "mangent", "mangent"])
        from backend.main import regular_er_forms
        self.assertEqual([row["form"] for row in regular_er_forms("manger", "passe-simple")], ["mangeai", "mangeas", "mangea", "mangea", "mangea", "mangeâmes", "mangeâtes", "mangèrent", "mangèrent"])
        self.assertEqual([row["form"] for row in regular_er_forms("manger", "imparfait")], [
            "mangeais", "mangeais", "mangeait", "mangeait", "mangeait",
            "mangions", "mangiez", "mangeaient", "mangeaient",
        ])
        self.assertEqual([row["form"] for row in regular_er_forms("changer", "imparfait")], [
            "changeais", "changeais", "changeait", "changeait", "changeait",
            "changions", "changiez", "changeaient", "changeaient",
        ])
        self.assertEqual([row["form"] for row in regular_er_forms("manger", "imperatif-present")], ["mange", "mangeons", "mangez"])
        for verb in ("appeler", "payer", "aller", "lever", "protéger", "jogger"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                regular_er_present(verb)

    def test_generates_twenty_questions_for_specific_verb_and_tense(self):
        result = generate_practice(GenerateRequest(verb="parler", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len(result["questions"]), 20)
        self.assertEqual({q["verb"] for q in result["questions"]}, {"parler"})
        self.assertEqual({q["tense"] for q in result["questions"]}, {"present"})
        self.assertNotIn("answer", result["questions"][0])

    def test_category_uses_catalog_and_returns_twenty_distinct_verbs(self):
        from backend.main import regular_first_group_verbs

        catalog_verbs = regular_first_group_verbs()
        self.assertGreater(len(catalog_verbs), 35)
        self.assertEqual(len(catalog_verbs), len(set(catalog_verbs)))

        result = generate_practice(GenerateRequest(
            family="premier-groupe-reguliers",
            construction="non-pronomial",
            tense="present",
        ))
        self.assertEqual(result["total"], 20)
        verbs = [question["verb"] for question in result["questions"]]
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(set(catalog_verbs)))

    def test_ger_family_random_mode_uses_twenty_distinct_catalog_verbs(self):
        from backend.main import SESSIONS, ger_family_verbs
        available = set(ger_family_verbs())
        self.assertGreaterEqual(len(available), 20)
        result = generate_practice(GenerateRequest(family="ger", tense="present"))
        self.assertEqual(result["total"], 20)
        verbs = [question["verb"] for question in result["questions"]]
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(available))
        self.assertNotIn("answer", result["questions"][0])
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_ger_family_supports_all_sixteen_tenses(self):
        tenses = ["present", "imparfait", "passe-compose", "plus-que-parfait", "passe-simple", "passe-anterieur", "futur-simple", "futur-anterieur", "subjonctif-present", "subjonctif-passe", "subjonctif-imparfait", "subjonctif-plus-que-parfait", "conditionnel-present", "conditionnel-passe", "imperatif-present", "imperatif-passe"]
        for tense in tenses:
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(verb="manger", family="ger", tense=tense))
                self.assertEqual(result["total"], 20)
                self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_ger_family_rejects_other_spelling_patterns(self):
        for verb in ("protéger", "jogger", "placer"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="ger", tense="present"))

    def test_cer_family_catalog_uses_only_pla_cer_non_pronominal_verbs(self):
        from backend.main import cer_family_verbs

        available = set(cer_family_verbs())
        self.assertEqual(len(available), 122)
        self.assertTrue({"commencer", "annoncer", "avancer", "placer"}.issubset(available))
        self.assertNotIn("dépecer", available)
        self.assertNotIn("redépecer", available)
        self.assertNotIn("s'efforcer", available)

    def test_cer_family_spelling_rules(self):
        from backend.main import regular_er_forms

        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "present")],
            ["commence", "commences", "commence", "commence", "commence", "commençons", "commencez", "commencent", "commencent"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "imparfait")],
            ["commençais", "commençais", "commençait", "commençait", "commençait", "commencions", "commenciez", "commençaient", "commençaient"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "passe-simple")],
            ["commençai", "commenças", "commença", "commença", "commença", "commençâmes", "commençâtes", "commencèrent", "commencèrent"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "subjonctif-present")],
            ["commence", "commences", "commence", "commence", "commence", "commencions", "commenciez", "commencent", "commencent"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "subjonctif-imparfait")],
            ["commençasse", "commençasses", "commençât", "commençât", "commençât", "commençassions", "commençassiez", "commençassent", "commençassent"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("commencer", "imperatif-present")],
            ["commence", "commençons", "commencez"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("placer", "present")],
            ["place", "places", "place", "place", "place", "plaçons", "placez", "placent", "placent"],
        )

    def test_cer_family_random_mode_uses_twenty_distinct_catalog_verbs(self):
        from backend.main import SESSIONS, cer_family_verbs

        available = set(cer_family_verbs())
        result = generate_practice(GenerateRequest(family="cer", tense="present"))
        self.assertEqual(result["total"], 20)
        verbs = [question["verb"] for question in result["questions"]]
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(available))
        self.assertNotIn("answer", result["questions"][0])
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_cer_family_supports_all_sixteen_tenses_individually(self):
        tenses = ["present", "imparfait", "passe-compose", "plus-que-parfait", "passe-simple", "passe-anterieur", "futur-simple", "futur-anterieur", "subjonctif-present", "subjonctif-passe", "subjonctif-imparfait", "subjonctif-plus-que-parfait", "conditionnel-present", "conditionnel-passe", "imperatif-present", "imperatif-passe"]
        for tense in tenses:
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(verb="commencer", family="cer", tense=tense))
                self.assertEqual(result["total"], 20)
                self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_cer_family_rejects_other_spelling_patterns(self):
        for verb in ("dépecer", "redépecer", "protéger", "s'efforcer"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="cer", tense="present"))
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="commencer", family="ger", tense="present"))

    def test_eler_catalog_and_random_practice(self):
        from backend.main import eler_family_verbs, SESSIONS
        available = set(eler_family_verbs())
        self.assertGreaterEqual(len(available), 20)
        self.assertTrue({"appeler", "geler", "harceler", "dénickeler"}.issubset(available))
        self.assertNotIn("s'appeler", available)
        result = generate_practice(GenerateRequest(family="eler", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len({q["verb"] for q in result["questions"]}), 20)
        self.assertTrue({q["verb"] for q in result["questions"]}.issubset(available))
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_eler_spelling_patterns(self):
        from backend.main import regular_er_forms
        cases = {
            ("appeler", "present"): ["appelle", "appelons", "appellent"],
            ("appeler", "futur-simple"): ["appellerai", "appellerons", "appelleront"],
            ("geler", "present"): ["gèle", "gelons", "gèlent"],
            ("geler", "futur-simple"): ["gèlerai", "gèlerons", "gèleront"],
            ("harceler", "present"): ["harcelle", "harcelons", "harcellent"],
            ("harceler", "imparfait"): ["harcelais", "harcelions", "harcelaient"],
            ("dénickeler", "present"): ["dénickelle", "dénickelons", "dénickellent"],
            ("dénickeler", "conditionnel-present"): ["dénickellerais", "dénickellerions", "dénickelleraient"],
        }
        for (verb, tense), expected in cases.items():
            with self.subTest(verb=verb, tense=tense):
                forms = regular_er_forms(verb, tense)
                self.assertEqual([forms[i]["form"] for i in (0, 5, 7)], expected)

    def test_eler_all_sixteen_tenses(self):
        from backend.main import TENSE_LABELS
        for verb in ("appeler", "geler", "harceler", "dénickeler"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="eler", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_eler_rejects_unrelated_verbs(self):
        for verb in ("parler", "manger", "commencer", "s'appeler", "aller"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="eler", tense="present"))

    def test_answer_check_accepts_missing_accents_and_case(self):
        session = generate_practice(GenerateRequest(verb="parler", tense="present"))
        first = session["questions"][0]
        answer_by_person = {
            "je": "parle", "tu": "parles", "il": "parle", "elle": "parle",
            "on": "parle", "nous": "parlons", "vous": "parlez",
            "ils": "parlent", "elles": "parlent",
        }
        result = check_answer(CheckRequest(
            session_id=session["session_id"],
            index=first["index"],
            answer=answer_by_person[first["person"]].upper(),
        ))
        self.assertTrue(result["correct"])

    def test_generates_practice_for_all_tenses(self):
        tenses = [
            "present", "imparfait", "passe-compose", "plus-que-parfait",
            "passe-simple", "passe-anterieur", "futur-simple", "futur-anterieur",
            "subjonctif-present", "subjonctif-passe", "subjonctif-imparfait",
            "subjonctif-plus-que-parfait", "conditionnel-present",
            "conditionnel-passe", "imperatif-present", "imperatif-passe",
        ]
        for tense in tenses:
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(verb="parler", tense=tense))
                self.assertEqual(result["total"], 20)
                self.assertEqual(len(result["questions"]), 20)
                self.assertEqual({question["tense"] for question in result["questions"]}, {tense})
                self.assertNotIn("answer", result["questions"][0])

    def test_compound_tenses_use_avoir_for_parler(self):
        session = generate_practice(GenerateRequest(verb="parler", tense="passe-compose"))
        answers = {row["person"]: row["answer"] for row in __import__("backend.main", fromlist=["SESSIONS"]).SESSIONS[session["session_id"]]}
        self.assertEqual(answers["je"], "ai parlé")
        self.assertEqual(answers["nous"], "avons parlé")

    def test_subjunctive_prompts_include_que(self):
        session = generate_practice(GenerateRequest(verb="parler", tense="subjonctif-present"))
        from backend.main import SESSIONS
        prompts = {row["person"] for row in SESSIONS[session["session_id"]]}
        self.assertTrue({"que je", "que tu", "qu'il", "que nous"}.issubset(prompts))

    def test_rejects_etre_for_compound_parler(self):
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="parler", tense="passe-compose", auxiliary="etre"))


if __name__ == "__main__":
    unittest.main()
