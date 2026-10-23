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
        for verb in ("aller", "jogger"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                regular_er_present(verb)
        self.assertEqual([row["form"] for row in regular_er_present("protéger")][0:6],
                         ["protège", "protèges", "protège", "protège", "protège", "protégeons"])

    def test_generates_twenty_questions_for_specific_verb_and_tense(self):
        result = generate_practice(GenerateRequest(verb="parler", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len(result["questions"]), 20)
        self.assertEqual({q["verb"] for q in result["questions"]}, {"parler"})
        self.assertEqual({q["tense"] for q in result["questions"]}, {"present"})
        self.assertNotIn("answer", result["questions"][0])

    def test_individual_e_accent_verb_works_without_explicit_family(self):
        from backend.main import regular_er_forms, e_accent_family_patterns
        self.assertIn("lever", e_accent_family_patterns())
        self.assertIn("promener", e_accent_family_patterns())
        for family in ("", "premier-groupe-reguliers", "e-accent"):
            with self.subTest(family=family):
                result = generate_practice(GenerateRequest(verb="lever", family=family, tense="present"))
                self.assertEqual(result["total"], 20)
                self.assertEqual({q["verb"] for q in result["questions"]}, {"lever"})
                self.assertEqual([row["form"] for row in regular_er_forms("lever", "present", family)][0:6],
                                 ["lève", "lèves", "lève", "lève", "lève", "levons"])
        self.assertEqual([row["form"] for row in regular_er_forms("promener", "present")][0:6],
                         ["promène", "promènes", "promène", "promène", "promène", "promenons"])
        self.assertEqual([row["form"] for row in regular_er_forms("promener", "futur-simple")][0:3],
                         ["promènerai", "promèneras", "promènera"])
        self.assertEqual([row["form"] for row in regular_er_forms("promener", "conditionnel-present")][0:3],
                         ["promènerais", "promènerais", "promènerait"])

    def test_pronominal_first_group_verbs_are_conjugated_and_classified(self):
        from backend.main import (
            TENSE_LABELS,
            e_accent_family_patterns,
            regular_er_forms,
            regular_first_group_verbs,
        )

        catalog_verbs = set(regular_first_group_verbs())
        self.assertIn("se laver", catalog_verbs)
        self.assertIn("s'arrêter", catalog_verbs)
        self.assertIn("se lever", e_accent_family_patterns())
        self.assertIn("se promener", e_accent_family_patterns())

        self.assertEqual(
            [row["form"] for row in regular_er_forms("se laver", "present")][:6],
            ["me lave", "te laves", "se lave", "se lave", "se lave", "nous lavons"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("se lever", "futur-simple")][:3],
            ["me lèverai", "te lèveras", "se lèvera"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("se laver", "passe-compose")][:6],
            ["me suis lavé", "t'es lavé", "s'est lavé", "s'est lavée", "s'est lavé", "nous sommes lavés"],
        )
        self.assertEqual(
            [row["form"] for row in regular_er_forms("se laver", "imperatif-present")],
            ["lave-toi", "lavons-nous", "lavez-vous"],
        )
        for tense in TENSE_LABELS:
            with self.subTest(tense=tense):
                self.assertTrue(regular_er_forms("se laver", tense))

    def test_pronominal_construction_filter_works_for_individual_and_small_families(self):
        from backend.main import SESSIONS, check_answer, pronominal_first_group_verbs

        self.assertIn("se laver", pronominal_first_group_verbs())
        individual = generate_practice(GenerateRequest(
            verb="se laver",
            construction="pronominal",
            tense="present",
        ))
        self.assertEqual({question["verb"] for question in individual["questions"]}, {"se laver"})

        family = generate_practice(GenerateRequest(
            family="e-accent",
            construction="pronominal",
            tense="present",
        ))
        self.assertEqual(family["total"], 20)
        self.assertTrue({question["verb"] for question in family["questions"]}.issubset({"se lever", "se promener"}))

        SESSIONS["pronominal-agreement-test"] = [{
            "person": "je",
            "verb": "se laver",
            "tense": "passe-compose",
            "answer": "me suis lavé",
        }]
        result = check_answer(CheckRequest(
            session_id="pronominal-agreement-test",
            index=0,
            answer="me suis lavée",
        ))
        self.assertTrue(result["correct"])


    def test_pronominal_variants_work_in_each_family_across_all_tenses(self):
        from backend.main import TENSE_LABELS

        examples = (
            ("se laver", "premier-groupe-reguliers"),
            ("s'allonger", "ger"),
            ("s'efforcer", "cer"),
            ("s'appeler", "eler"),
            ("s'inquiéter", "eter"),
            ("s'ennuyer", "yer"),
            ("se lever", "e-accent"),
            ("se promener", "e-accent"),
        )
        for verb, family in examples:
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, family=family, tense=tense):
                    result = generate_practice(GenerateRequest(
                        verb=verb,
                        family=family,
                        construction="pronominal",
                        tense=tense,
                    ))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({question["verb"] for question in result["questions"]}, {verb})
                    self.assertEqual({question["tense"] for question in result["questions"]}, {tense})

    def test_pronominal_random_mode_filters_each_family(self):
        families = ("premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent")
        for family in families:
            with self.subTest(family=family):
                result = generate_practice(GenerateRequest(
                    family=family,
                    construction="pronominal",
                    tense="present",
                ))
                self.assertEqual(result["total"], 20)
                self.assertTrue(all(
                    question["verb"].startswith(("se ", "s'"))
                    for question in result["questions"]
                ))


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
        from backend.main import TENSE_LABELS
        for verb in ("manger", "protéger"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="ger", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_ger_family_includes_accented_ger_patterns_but_rejects_other_families(self):
        from backend.main import ger_family_verbs, regular_er_forms
        available = set(ger_family_verbs())
        self.assertIn("protéger", available)
        self.assertIn("abréger", available)
        self.assertNotIn("jogger", available)
        self.assertEqual([row["form"] for row in regular_er_forms("protéger", "present", "ger")][0:6],
                         ["protège", "protèges", "protège", "protège", "protège", "protégeons"])
        self.assertEqual([row["form"] for row in regular_er_forms("protéger", "futur-simple", "ger")][0:3],
                         ["protégerai", "protégeras", "protégera"])
        for verb in ("jogger", "placer"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="ger", tense="present"))

    def test_cer_family_catalog_includes_supported_cer_patterns(self):
        from backend.main import cer_family_verbs

        available = set(cer_family_verbs())
        self.assertEqual(len(available), 126)
        self.assertTrue({"commencer", "annoncer", "avancer", "placer", "dépecer", "s'efforcer"}.issubset(available))
        from backend.main import regular_er_forms
        self.assertEqual([row["form"] for row in regular_er_forms("dépecer", "present", "cer")][0:6],
                         ["dépece", "dépeces", "dépece", "dépece", "dépece", "dépeçons"])
        self.assertEqual([row["form"] for row in regular_er_forms("dépecer", "imparfait", "cer")][0:6],
                         ["dépeçais", "dépeçais", "dépeçait", "dépeçait", "dépeçait", "dépecions"])

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
        from backend.main import TENSE_LABELS
        for verb in ("commencer", "dépecer"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="cer", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_cer_family_rejects_other_spelling_patterns(self):
        for verb in ("protéger",):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="cer", tense="present"))
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="commencer", family="ger", tense="present"))

    def test_eler_catalog_and_random_practice(self):
        from backend.main import eler_family_verbs, SESSIONS
        available = set(eler_family_verbs())
        self.assertGreaterEqual(len(available), 20)
        self.assertTrue({"appeler", "geler", "harceler", "dénickeler", "révéler"}.issubset(available))
        self.assertIn("s'appeler", available)
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
            ("révéler", "present"): ["révèle", "révélons", "révèlent"],
            ("révéler", "futur-simple"): ["révélerai", "révélerons", "révéleront"],
        }
        for (verb, tense), expected in cases.items():
            with self.subTest(verb=verb, tense=tense):
                forms = regular_er_forms(verb, tense)
                self.assertEqual([forms[i]["form"] for i in (0, 5, 7)], expected)

    def test_eler_all_sixteen_tenses(self):
        from backend.main import TENSE_LABELS
        for verb in ("appeler", "geler", "harceler", "dénickeler", "révéler"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="eler", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_eler_rejects_unrelated_verbs(self):
        for verb in ("parler", "manger", "commencer", "aller"):
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


class EAccentFamilyTests(unittest.TestCase):
    def test_e_accent_catalog_excludes_specific_suffix_families(self):
        from backend.main import e_accent_family_patterns
        patterns = e_accent_family_patterns()
        verbs = set(patterns)
        self.assertGreaterEqual(len(verbs), 20)
        self.assertTrue({"céder", "espérer", "lever", "mener", "peser", "semer", "receper", "recéper"}.issubset(verbs))
        self.assertNotIn("protéger", verbs)
        self.assertNotIn("révéler", verbs)
        self.assertNotIn("acheter", verbs)
        self.assertNotIn("jeter", verbs)
        self.assertNotIn("dépecer", verbs)

    def test_e_accent_spelling_rules(self):
        from backend.main import regular_er_forms
        cases = {
            ("céder", "present"): ["cède", "cédons", "cèdent"],
            ("espérer", "present"): ["espère", "espérons", "espèrent"],
            ("lever", "present"): ["lève", "levons", "lèvent"],
            ("lever", "futur-simple"): ["lèverai", "lèverons", "lèveront"],
            ("mener", "futur-simple"): ["mènerai", "mènerons", "mèneront"],
            ("peser", "conditionnel-present"): ["pèserais", "pèserions", "pèseraient"],
            ("receper", "present"): ["recèpe", "recepons", "recèpent"],
            ("receper", "futur-simple"): ["recèperai", "recèperons", "recèperont"],
            ("recéper", "present"): ["recèpe", "recépons", "recèpent"],
            ("recéper", "futur-simple"): ["recèperai", "recèperons", "recèperont"],
        }
        for (verb, tense), expected in cases.items():
            with self.subTest(verb=verb, tense=tense):
                forms = regular_er_forms(verb, tense, "e-accent")
                self.assertEqual([forms[i]["form"] for i in (0, 5, 7)], expected)

    def test_e_accent_supports_all_sixteen_tenses_individually(self):
        from backend.main import TENSE_LABELS
        for verb in ("céder", "espérer", "lever", "mener"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="e-accent", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_e_accent_random_practice_uses_twenty_distinct_catalog_verbs(self):
        from backend.main import SESSIONS, e_accent_family_patterns
        available = set(e_accent_family_patterns())
        result = generate_practice(GenerateRequest(family="e-accent", tense="present"))
        verbs = [q["verb"] for q in result["questions"]]
        self.assertEqual(len(verbs), 20)
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(available))
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_e_accent_rejects_verbs_from_specific_families(self):
        for verb in ("protéger", "abréger", "révéler", "répéter", "hébéter", "acheter", "jeter", "dépecer", "parler"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="e-accent", tense="present"))


class EterFamilyTests(unittest.TestCase):
    def test_eter_catalog_and_random_practice(self):
        from backend.main import eter_family_patterns, eter_family_verbs, SESSIONS
        patterns = eter_family_patterns()
        available = set(eter_family_verbs())
        self.assertEqual(len(available), 105)
        self.assertEqual(len(patterns), 105)
        self.assertEqual(sum(pattern == "ach:eter" for pattern in patterns.values()), 13)
        self.assertEqual(sum(pattern == "j:eter" for pattern in patterns.values()), 69)
        self.assertEqual(sum(pattern == "décr:éter" for pattern in patterns.values()), 22)
        self.assertEqual(sum(pattern == "héb:éter" for pattern in patterns.values()), 1)
        self.assertIn("répéter", available)
        self.assertIn("hébéter", available)
        self.assertIn("acheter", available)
        self.assertIn("jeter", available)
        self.assertNotIn("duveter", available)
        result = generate_practice(GenerateRequest(family="eter", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len({q["verb"] for q in result["questions"]}), 20)
        self.assertTrue({q["verb"] for q in result["questions"]}.issubset(available))
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_eter_spelling_patterns(self):
        from backend.main import regular_er_forms
        cases = {
            ("acheter", "present"): ["achète", "achetons", "achètent"],
            ("acheter", "futur-simple"): ["achèterai", "achèterons", "achèteront"],
            ("acheter", "conditionnel-present"): ["achèterais", "achèterions", "achèteraient"],
            ("acheter", "subjonctif-present"): ["achète", "achetions", "achètent"],
            ("acheter", "imperatif-present"): ["achète", "achetons", "achetez"],
            ("jeter", "present"): ["jette", "jetons", "jettent"],
            ("jeter", "futur-simple"): ["jetterai", "jetterons", "jetteront"],
            ("jeter", "conditionnel-present"): ["jetterais", "jetterions", "jetteraient"],
            ("jeter", "subjonctif-present"): ["jette", "jetions", "jettent"],
            ("jeter", "imperatif-present"): ["jette", "jetons", "jetez"],
            ("répéter", "present"): ["répète", "répétons", "répètent"],
            ("répéter", "futur-simple"): ["répéterai", "répéterons", "répéteront"],
        }
        for (verb, tense), expected in cases.items():
            with self.subTest(verb=verb, tense=tense):
                forms = regular_er_forms(verb, tense)
                if tense == "imperatif-present":
                    actual = [forms[i]["form"] for i in range(3)]
                else:
                    actual = [forms[i]["form"] for i in (0, 5, 7)]
                self.assertEqual(actual, expected)

    def test_eter_all_sixteen_tenses(self):
        from backend.main import TENSE_LABELS
        for verb in ("acheter", "jeter", "haleter", "répéter", "hébéter"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="eter", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_eter_rejects_unrelated_or_unsupported_verbs(self):
        for verb in ("parler", "manger", "commencer", "duveter", "aller", "protéger"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="eter", tense="present"))
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="acheter", family="ger", tense="present"))

    def test_eter_does_not_change_regular_compound_tenses(self):
        from backend.main import regular_er_forms
        self.assertEqual(regular_er_forms("acheter", "passe-compose")[0]["form"], "ai acheté")
        self.assertEqual(regular_er_forms("jeter", "plus-que-parfait")[6]["form"], "aviez jeté")



class YerFamilyTests(unittest.TestCase):
    def test_yer_catalog_contains_only_supported_non_pronominal_patterns(self):
        from backend.main import yer_family_patterns, yer_family_verbs
        patterns = yer_family_patterns()
        verbs = set(yer_family_verbs())
        self.assertGreaterEqual(len(verbs), 20)
        self.assertEqual(len(patterns), len(verbs))
        self.assertTrue({"payer", "balayer", "essayer", "nettoyer", "envoyer", "renvoyer", "grasseyer"}.issubset(verbs))
        self.assertTrue({"s'ennuyer", "s'essuyer"}.issubset(verbs))
        self.assertNotIn("capeyer", verbs)

    def test_yer_present_and_future_forms(self):
        from backend.main import regular_er_forms
        cases = {
            ("payer", "present"): ["paie", "payons", "paient"],
            ("balayer", "present"): ["balaie", "balayons", "balaient"],
            ("nettoyer", "present"): ["nettoie", "nettoyons", "nettoient"],
            ("envoyer", "present"): ["envoie", "envoyons", "envoient"],
            ("payer", "futur-simple"): ["paierai", "paierons", "paieront"],
            ("nettoyer", "futur-simple"): ["nettoierai", "nettoierons", "nettoieront"],
            ("envoyer", "futur-simple"): ["enverrai", "enverrons", "enverront"],
            ("renvoyer", "conditionnel-present"): ["renverrais", "renverrions", "renverraient"],
            ("grasseyer", "present"): ["grasseye", "grasseyons", "grasseyent"],
        }
        for (verb, tense), expected in cases.items():
            with self.subTest(verb=verb, tense=tense):
                forms = regular_er_forms(verb, tense)
                self.assertEqual([forms[i]["form"] for i in (0, 5, 7)], expected)

    def test_yer_accepts_valid_ayer_variants(self):
        from backend.main import SESSIONS
        cases = [
            ("payer", "present", "je", "paye"),
            ("payer", "present", "ils", "payent"),
            ("payer", "futur-simple", "je", "payerai"),
            ("payer", "conditionnel-present", "je", "payerais"),
            ("payer", "subjonctif-present", "que je", "paye"),
        ]
        for verb, tense, person, answer in cases:
            with self.subTest(verb=verb, tense=tense, answer=answer):
                session = generate_practice(GenerateRequest(verb=verb, family="yer", tense=tense))
                index = next(i for i, q in enumerate(SESSIONS[session["session_id"]]) if q["person"] == person)
                result = check_answer(CheckRequest(session_id=session["session_id"], index=index, answer=answer))
                self.assertTrue(result["correct"])
        session = generate_practice(GenerateRequest(verb="payer", family="yer", tense="present"))
        index = next(i for i, q in enumerate(SESSIONS[session["session_id"]]) if q["person"] == "je")
        result = check_answer(CheckRequest(session_id=session["session_id"], index=index, answer="paie"))
        self.assertTrue(result["correct"])

    def test_yer_supports_all_sixteen_tenses_individually(self):
        from backend.main import TENSE_LABELS
        for verb in ("payer", "nettoyer", "envoyer", "grasseyer"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="yer", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})

    def test_yer_random_practice_uses_twenty_distinct_catalog_verbs(self):
        from backend.main import SESSIONS, yer_family_verbs
        available = set(yer_family_verbs())
        result = generate_practice(GenerateRequest(family="yer", tense="present"))
        verbs = [q["verb"] for q in result["questions"]]
        self.assertEqual(len(verbs), 20)
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(available))
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)

    def test_yer_rejects_unsupported_verbs_and_patterns(self):
        for verb in ("parler", "payer"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="eter", tense="present"))
        for verb in ("parler", "capeyer", "aller"):
            with self.subTest(verb=verb), self.assertRaises(HTTPException):
                generate_practice(GenerateRequest(verb=verb, family="yer", tense="present"))


if __name__ == "__main__":
    unittest.main()
