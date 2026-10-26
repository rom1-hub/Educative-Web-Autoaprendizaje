import unittest

from fastapi import HTTPException

from backend.main import (
    CheckRequest,
    GenerateRequest,
    check_answer,
    generate_practice,
    regular_er_present,
)




class ThirdGroupIRIntegrationTests(unittest.TestCase):
    def test_inventory_includes_required_pronominal_ir_verbs_and_excludes_second_group(self):
        from backend.main import third_group_ir_verbs, third_group_ir_pronominal_verbs

        verbs = set(third_group_ir_verbs())
        pronominal = set(third_group_ir_pronominal_verbs())
        self.assertTrue({"s'endormir", "s'enfuir", "se sentir", "se servir", "se souvenir"}.issubset(pronominal))
        self.assertTrue({"dormir", "fuir", "partir", "sortir", "venir", "mourir"}.issubset(verbs))
        self.assertNotIn("fleurir", verbs)
        self.assertNotIn("amuïr", verbs)
        self.assertFalse(any(verb.endswith("oir") for verb in verbs))



    def test_individual_third_group_ir_verbs_accept_generic_third_group_profile(self):
        from backend.main import SESSIONS

        for verb in ("dormir", "partir"):
            with self.subTest(verb=verb):
                result = generate_practice(GenerateRequest(
                    verb=verb, family="troisieme-groupe", tense="present"
                ))
                self.assertEqual(result["total"], 20)
                self.assertEqual(len(result["questions"]), 20)
                self.assertTrue(all(question["verb"] == verb for question in result["questions"]))
                self.assertIn(result["session_id"], SESSIONS)

    def test_individual_third_group_ir_verbs_work_with_specific_family(self):
        for verb in ("dormir", "partir"):
            with self.subTest(verb=verb):
                result = generate_practice(GenerateRequest(
                    verb=verb, family="ir", tense="present"
                ))
                self.assertEqual(result["total"], 20)
                self.assertTrue(all(question["verb"] == verb for question in result["questions"]))

    def test_s_endormir_uses_base_forms_and_correct_pronominal_prefixes(self):
        from backend.main import third_group_ir_forms

        expected = {
            "present": ("m'endors", "s'endort", "nous endormons"),
            "imparfait": ("m'endormais", "s'endormait", "nous endormions"),
            "passe-simple": ("m'endormis", "s'endormit", "nous endormîmes"),
            "futur-simple": ("m'endormirai", "s'endormira", "nous endormirons"),
            "passe-compose": ("me suis endormi", "s'est endormi", "nous sommes endormis"),
        }
        for tense, forms_expected in expected.items():
            with self.subTest(tense=tense):
                forms = third_group_ir_forms("s'endormir", tense)
                self.assertEqual(forms[0]["form"], forms_expected[0])
                self.assertEqual(forms[2]["form"], forms_expected[1])
                self.assertEqual(forms[5]["form"], forms_expected[2])

    def test_all_sixteen_tenses_are_generated_only_when_canonical_forms_exist(self):
        from backend.main import TENSE_LABELS, third_group_ir_forms

        for tense in TENSE_LABELS:
            with self.subTest(tense=tense):
                forms = third_group_ir_forms("dormir", tense)
                self.assertTrue(forms)
                self.assertTrue(all(form["form"].strip() for form in forms))
                self.assertTrue(all(form["tense"] == tense for form in forms))

    def test_family_practice_returns_twenty_questions_with_twelve_nonpronominal_and_eight_pronominal(self):
        from backend.main import SESSIONS, third_group_ir_pronominal_verbs

        result = generate_practice(GenerateRequest(family="ir", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len(result["questions"]), 20)
        answers = SESSIONS[result["session_id"]]
        pronominal_set = set(third_group_ir_pronominal_verbs())
        self.assertEqual(sum(item["verb"] in pronominal_set for item in answers), 8)
        self.assertEqual(sum(item["verb"] not in pronominal_set for item in answers), 12)

    def test_pronominal_and_auxiliary_filters_are_respected(self):
        from backend.main import third_group_ir_pronominal_verbs

        pronominal = generate_practice(GenerateRequest(
            family="ir", construction="pronominal", tense="passe-compose", auxiliary="etre"
        ))
        self.assertEqual(pronominal["total"], 20)
        self.assertTrue(all(q["verb"] in third_group_ir_pronominal_verbs() for q in pronominal["questions"]))

        nonpronominal_etre = generate_practice(GenerateRequest(
            verb="mourir", family="ir", tense="passe-compose", auxiliary="etre"
        ))
        self.assertEqual(nonpronominal_etre["total"], 20)
        self.assertTrue(all(q["verb"] == "mourir" for q in nonpronominal_etre["questions"]))

        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(
                verb="s'endormir", family="ir", tense="passe-compose", auxiliary="avoir"
            ))

    def test_defective_verbs_are_excluded_from_compound_category_when_participle_is_missing(self):
        from backend.main import third_group_ir_available_verbs

        compound_candidates = set(third_group_ir_available_verbs("passe-compose"))
        self.assertNotIn("gésir", compound_candidates)
        self.assertNotIn("fuir", compound_candidates)
        self.assertIn("fuir", set(third_group_ir_available_verbs("present")))



class ThirdGroupDreIntegrationTests(unittest.TestCase):
    def test_inventory_includes_dre_subfamilies_and_pronominal_variants(self):
        from backend.main import third_group_dre_verbs, third_group_dre_pronominal_verbs

        verbs = set(third_group_dre_verbs())
        pronominal = set(third_group_dre_pronominal_verbs())
        self.assertTrue({
            "prendre", "vendre", "attendre", "répondre", "rendre",
            "craindre", "joindre", "peindre", "coudre", "moudre", "résoudre",
        }.issubset(verbs))
        self.assertIn("s'attendre", pronominal)
        self.assertNotIn("attendre", pronominal)
        self.assertTrue(all(verb.endswith("dre") for verb in verbs))

    def test_individual_verbs_accept_generic_and_specific_family_profiles(self):
        from backend.main import SESSIONS

        for verb in ("prendre", "vendre"):
            for family in ("troisieme-groupe", "dre"):
                with self.subTest(verb=verb, family=family):
                    result = generate_practice(GenerateRequest(verb=verb, family=family, tense="present"))
                    self.assertEqual(result["total"], 20)
                    self.assertTrue(all(question["verb"] == verb for question in result["questions"]))
                    self.assertIn(result["session_id"], SESSIONS)

    def test_all_tenses_are_generated_from_canonical_forms(self):
        from backend.main import TENSE_LABELS, third_group_dre_forms

        for verb in ("prendre", "craindre", "joindre", "peindre", "coudre", "moudre", "résoudre"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    forms = third_group_dre_forms(verb, tense)
                    self.assertTrue(forms)
                    self.assertTrue(all(row["form"].strip() for row in forms))
                    self.assertTrue(all(row["tense"] == tense for row in forms))

    def test_category_practice_has_twenty_questions_and_60_40_mix(self):
        from backend.main import SESSIONS, third_group_dre_pronominal_verbs

        result = generate_practice(GenerateRequest(family="dre", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len(result["questions"]), 20)
        stored = SESSIONS[result["session_id"]]
        pronominal = set(third_group_dre_pronominal_verbs())
        self.assertEqual(sum(row["verb"] in pronominal for row in stored), 8)
        self.assertEqual(sum(row["verb"] not in pronominal for row in stored), 12)

    def test_auxiliary_filters_respect_canonical_metadata(self):
        from backend.main import third_group_dre_auxiliaries, third_group_dre_forms

        self.assertIn("avoir", third_group_dre_auxiliaries("prendre"))
        self.assertEqual(third_group_dre_auxiliaries("s'attendre"), ("etre",))
        forms = third_group_dre_forms("s'attendre", "passe-compose", "etre")
        self.assertTrue(forms)
        with self.assertRaises(HTTPException):
            third_group_dre_forms("prendre", "passe-compose", "etre")


class ThirdGroupAitreIntegrationTests(unittest.TestCase):
    def test_inventory_includes_both_aitre_and_oitre_endings_and_pronominal_variants(self):
        from backend.main import third_group_aitre_verbs, third_group_aitre_pronominal_verbs
        verbs = set(third_group_aitre_verbs())
        pronominal = set(third_group_aitre_pronominal_verbs())
        self.assertTrue({"connaître", "paraître", "apparaître", "naître", "croître"}.issubset(verbs))
        self.assertTrue(all(verb.endswith(("aître", "oître")) for verb in verbs))
        self.assertIn("se connaître", pronominal)
        self.assertNotIn("connaître", pronominal)

    def test_individual_verbs_accept_generic_and_specific_family_profiles(self):
        from backend.main import SESSIONS
        for verb in ("connaître", "naître"):
            for family in ("troisieme-groupe", "aitre"):
                with self.subTest(verb=verb, family=family):
                    result = generate_practice(GenerateRequest(verb=verb, family=family, tense="present"))
                    self.assertEqual(result["total"], 20)
                    self.assertTrue(all(q["verb"] == verb for q in result["questions"]))
                    self.assertIn(result["session_id"], SESSIONS)

    def test_all_tenses_are_generated_from_canonical_forms(self):
        from backend.main import TENSE_LABELS, third_group_aitre_forms
        for tense in TENSE_LABELS:
            with self.subTest(tense=tense):
                forms = third_group_aitre_forms("connaître", tense)
                self.assertTrue(forms)
                self.assertTrue(all(row["form"].strip() for row in forms))
                self.assertTrue(all(row["tense"] == tense for row in forms))

    def test_category_practice_has_twenty_questions_and_60_40_mix(self):
        from backend.main import SESSIONS, third_group_aitre_pronominal_verbs
        result = generate_practice(GenerateRequest(family="aitre", tense="present"))
        self.assertEqual(result["total"], 20)
        self.assertEqual(len(result["questions"]), 20)
        stored = SESSIONS[result["session_id"]]
        pronominal = set(third_group_aitre_pronominal_verbs())
        self.assertEqual(sum(row["verb"] in pronominal for row in stored), 8)
        self.assertEqual(sum(row["verb"] not in pronominal for row in stored), 12)

    def test_auxiliary_filters_respect_canonical_metadata(self):
        from backend.main import third_group_aitre_auxiliaries
        self.assertIn("avoir", third_group_aitre_auxiliaries("connaître"))
        self.assertIn("etre", third_group_aitre_auxiliaries("naître"))
        result = generate_practice(GenerateRequest(
            verb="naître", family="aitre", tense="passe-compose", auxiliary="etre"
        ))
        self.assertEqual(result["total"], 20)
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(
                verb="connaître", family="aitre", tense="passe-compose", auxiliary="etre"
            ))


class EvanouirIndividualPracticeTests(unittest.TestCase):
    def test_s_evanouir_uses_canonical_second_group_forms_in_all_sixteen_tenses(self):
        from backend.main import (
            TENSE_LABELS,
            second_group_forms,
            second_group_pronominal_verbs,
        )

        expected = {
            "present": ("m'évanouis", "s'évanouit", "nous évanouissons"),
            "imparfait": ("m'évanouissais", "s'évanouissait", "nous évanouissions"),
            "passe-simple": ("m'évanouis", "s'évanouit", "nous évanouîmes"),
            "futur-simple": ("m'évanouirai", "s'évanouira", "nous évanouirons"),
            "conditionnel-present": ("m'évanouirais", "s'évanouirait", "nous évanouirions"),
            "subjonctif-present": ("m'évanouisse", "s'évanouisse", "nous évanouissions"),
            "subjonctif-imparfait": ("m'évanouisse", "s'évanouît", "nous évanouissions"),
            "passe-compose": ("me suis évanoui", "s'est évanoui", "nous sommes évanouis"),
            "plus-que-parfait": ("m'étais évanoui", "s'était évanoui", "nous étions évanouis"),
            "passe-anterieur": ("me fus évanoui", "se fut évanoui", "nous fûmes évanouis"),
            "futur-anterieur": ("me serai évanoui", "se sera évanoui", "nous serons évanouis"),
            "conditionnel-passe": ("me serais évanoui", "se serait évanoui", "nous serions évanouis"),
            "subjonctif-passe": ("me sois évanoui", "se soit évanoui", "nous soyons évanouis"),
            "subjonctif-plus-que-parfait": ("me fusse évanoui", "se fût évanoui", "nous fussions évanouis"),
            "imperatif-present": ("évanouis-toi", "évanouissons-nous", "évanouissez-vous"),
            "imperatif-passe": ("sois-toi évanoui", "soyons-nous évanouis", "soyez-vous évanouis"),
        }
        self.assertEqual(set(expected), set(TENSE_LABELS))
        self.assertIn("s'évanouir", second_group_pronominal_verbs())

        for tense, expected_forms in expected.items():
            with self.subTest(tense=tense):
                forms = second_group_forms("s'évanouir", tense)
                self.assertTrue(forms)
                self.assertEqual(forms[0]["form"], expected_forms[0])
                if tense.startswith("subjonctif-"):
                    self.assertEqual(forms[2]["form"], expected_forms[1])
                    self.assertEqual(forms[5]["form"], expected_forms[2])
                elif tense.startswith("imperatif-"):
                    self.assertEqual(forms[1]["form"], expected_forms[1])
                    self.assertEqual(forms[2]["form"], expected_forms[2])
                else:
                    self.assertEqual(forms[2]["form"], expected_forms[1])
                    self.assertEqual(forms[5]["form"], expected_forms[2])

    def test_s_evanouir_generates_twenty_individual_questions_in_every_tense(self):
        from backend.main import COMPOUND_TENSES, SESSIONS, TENSE_LABELS

        for tense in TENSE_LABELS:
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(
                    verb="s'évanouir",
                    tense=tense,
                    family="deuxieme-groupe",
                    construction="pronominal",
                    auxiliary="etre" if tense in COMPOUND_TENSES else "",
                ))
                self.assertEqual(result["total"], 20)
                self.assertEqual(len(result["questions"]), 20)
                self.assertEqual({q["verb"] for q in result["questions"]}, {"s'évanouir"})
                stored = SESSIONS[result["session_id"]]
                self.assertTrue(all(item["answer"] for item in stored))
                self.assertTrue(all(any(stem in item["answer"] for stem in ("évanoui", "évanouî")) for item in stored))

    def test_non_pronominal_evanouir_is_rejected_for_individual_practice(self):
        with self.assertRaises(HTTPException) as error:
            generate_practice(GenerateRequest(verb="évanouir", tense="present"))
        self.assertEqual(error.exception.status_code, 422)
        self.assertIn("s'évanouir", str(error.exception.detail))


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

        # Every supported pronominal verb must keep a space after "vous",
        # including compound tenses whose auxiliary begins with a vowel.
        pronominal_verbs = ("se laver", "se réveiller", "se parler")
        non_imperative_tenses = tuple(
            tense for tense in TENSE_LABELS
            if tense not in ("imperatif-present", "imperatif-passe")
        )
        for verb in pronominal_verbs:
            for tense in non_imperative_tenses:
                with self.subTest(verb=verb, tense=tense):
                    forms = regular_er_forms(verb, tense)
                    self.assertGreater(len(forms), 6)
                    self.assertTrue(forms[6]["form"].startswith("vous "), forms[6]["form"])
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

    def test_pronominal_compound_practice_accepts_etre(self):
        from backend.main import COMPOUND_TENSES

        examples = (
            ("se laver", ""),
            ("s'arrêter", "premier-groupe-reguliers"),
            ("se lever", "e-accent"),
            ("s'efforcer", "cer"),
        )
        for verb, family in examples:
            for tense in COMPOUND_TENSES:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(
                        verb=verb,
                        family=family,
                        construction="pronominal",
                        tense=tense,
                        auxiliary="etre",
                    ))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({question["verb"] for question in result["questions"]}, {verb})
                    self.assertEqual({question["tense"] for question in result["questions"]}, {tense})

        category = generate_practice(GenerateRequest(
            family="e-accent",
            construction="pronominal",
            tense="passe-compose",
            auxiliary="etre",
        ))
        self.assertEqual(category["total"], 20)
        self.assertTrue(all(
            question["verb"].startswith(("se ", "s'"))
            for question in category["questions"]
        ))

    def test_etre_auxiliary_still_rejects_unconfigured_non_pronominal_verbs(self):
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(
                verb="parler",
                tense="passe-compose",
                auxiliary="etre",
            ))

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


class EtrePriorityCompoundTests(unittest.TestCase):
    def test_priority_verbs_use_etre_for_every_compound_tense(self):
        from backend.main import COMPOUND_TENSES, SESSIONS, TENSE_LABELS, expand_practice_etre_subject_variants, regular_er_forms

        verbs = {
            "entrer": "entré",
            "monter": "monté",
            "descendre": "descendu",
            "passer": "passé",
            "sortir": "sorti",
            "retourner": "retourné",
            "arriver": "arrivé",
        }
        expected_auxiliaries = {
            "passe-compose": ["suis", "es", "est", "est", "est", "sommes", "êtes", "sont", "sont"],
            "plus-que-parfait": ["étais", "étais", "était", "était", "était", "étions", "étiez", "étaient", "étaient"],
            "passe-anterieur": ["fus", "fus", "fut", "fut", "fut", "fûmes", "fûtes", "furent", "furent"],
            "futur-anterieur": ["serai", "seras", "sera", "sera", "sera", "serons", "serez", "seront", "seront"],
            "subjonctif-passe": ["sois", "sois", "soit", "soit", "soit", "soyons", "soyez", "soient", "soient"],
            "subjonctif-plus-que-parfait": ["fusse", "fusses", "fût", "fût", "fût", "fussions", "fussiez", "fussent", "fussent"],
            "conditionnel-passe": ["serais", "serais", "serait", "serait", "serait", "serions", "seriez", "seraient", "seraient"],
        }
        for verb, participle in verbs.items():
            for tense in TENSE_LABELS:
                if tense not in COMPOUND_TENSES:
                    continue
                with self.subTest(verb=verb, tense=tense):
                    forms = regular_er_forms(verb, tense)
                    if tense == "imperatif-passe":
                        self.assertEqual([row["form"].split()[0] for row in forms], ["sois", "soyons", "soyez"])
                        self.assertEqual([row["person"] for row in forms], ["tu*", "nous*", "vous*"])
                    else:
                        self.assertEqual([row["form"].split()[0] for row in forms], expected_auxiliaries[tense])
                    for row in forms:
                        self.assertIn(row["form"].split()[-1], {
                            participle,
                            participle + "e",
                            participle + "s",
                            participle + "es",
                        })

                    session = generate_practice(GenerateRequest(
                        verb=verb,
                        tense=tense,
                        auxiliary="etre",
                    ))
                    self.assertEqual(session["total"], 20)
                    expected_practice_forms = expand_practice_etre_subject_variants(forms, verb, tense)
                    session_answers = {
                        row["answer"] for row in SESSIONS[session["session_id"]]
                    }
                    self.assertTrue(session_answers.issubset({row["form"] for row in expected_practice_forms}))

    def test_priority_rule_overrides_avoir_filter_for_listed_verbs(self):
        from backend.main import SESSIONS, expand_practice_etre_subject_variants, regular_er_forms

        expected = {
            row["form"] for row in expand_practice_etre_subject_variants(
                regular_er_forms("monter", "passe-compose"), "monter", "passe-compose"
            )
        }
        session = generate_practice(GenerateRequest(
            verb="monter",
            tense="passe-compose",
            auxiliary="avoir",
        ))
        self.assertTrue({
            row["answer"] for row in SESSIONS[session["session_id"]]
        }.issubset(expected))

    def test_priority_verbs_keep_supported_simple_er_tenses(self):
        from backend.main import regular_er_forms

        for verb, expected in (
            ("entrer", "entre"),
            ("monter", "monte"),
            ("passer", "passe"),
            ("retourner", "retourne"),
            ("arriver", "arrive"),
        ):
            with self.subTest(verb=verb):
                self.assertEqual(regular_er_forms(verb, "present")[0]["form"], expected)

    def test_etre_auxiliary_filter_can_select_priority_verbs_in_random_category(self):
        from backend.main import ETRE_PRIORITY_PARTICIPLES, SESSIONS, regular_first_group_verbs

        available_priority_verbs = set(regular_first_group_verbs()) & set(ETRE_PRIORITY_PARTICIPLES)
        self.assertTrue(available_priority_verbs)
        session = generate_practice(GenerateRequest(
            family="premier-groupe-reguliers",
            tense="passe-compose",
            auxiliary="etre",
        ))
        generated_verbs = {question["verb"] for question in session["questions"]}
        self.assertTrue(generated_verbs.issubset(available_priority_verbs))


class SecondGroupIntegrationTests(unittest.TestCase):
    def test_catalog_exposes_second_group_and_pronominal_candidates(self):
        from backend.main import second_group_verbs, second_group_pronominal_verbs
        verbs = set(second_group_verbs())
        pronominal = set(second_group_pronominal_verbs())
        self.assertGreaterEqual(len(verbs), 300)
        self.assertTrue({"finir", "choisir", "agir", "évanouir"}.issubset(verbs))
        self.assertTrue({
            "s'accroupir", "se blottir", "s'enorgueillir",
            "se pourrir", "se tapir", "s'ébaubir", "s'évanouir", "s'agir",
        }.issubset(pronominal))

    def test_second_group_present_and_compound_forms(self):
        from backend.main import SESSIONS
        session = generate_practice(GenerateRequest(verb="finir", family="deuxieme-groupe", tense="present"))
        answers = {row["person"]: row["answer"] for row in SESSIONS[session["session_id"]]}
        self.assertEqual(answers["je"], "finis")
        self.assertEqual(answers["nous"], "finissons")

        session = generate_practice(GenerateRequest(verb="finir", family="deuxieme-groupe", tense="passe-compose"))
        answers = {row["person"]: row["answer"] for row in SESSIONS[session["session_id"]]}
        self.assertEqual(answers["je"], "ai fini")
        self.assertEqual(answers["nous"], "avons fini")

        session = generate_practice(GenerateRequest(verb="accroupir", family="deuxieme-groupe", tense="passe-compose"))
        answers = {row["person"]: row["answer"] for row in SESSIONS[session["session_id"]]}
        self.assertEqual(answers["je"], "ai accroupi")

    def test_pronominal_second_group_uses_etre_and_agreement(self):
        from backend.main import SESSIONS
        session = generate_practice(GenerateRequest(verb="s'évanouir", tense="passe-compose"))
        answers = {row["person"]: row["answer"] for row in SESSIONS[session["session_id"]]}
        self.assertIn("me suis évanoui", answers.values())
        self.assertIn("me suis évanouie", answers.values())
        self.assertIn("s'est évanouie", answers.values())
        self.assertTrue(any(answer.startswith("nous sommes évanouis") for answer in answers.values()))

    def test_all_sixteen_tenses_for_second_group(self):
        from backend.main import TENSE_LABELS
        for verb in ("finir", "s'évanouir"):
            for tense in TENSE_LABELS:
                with self.subTest(verb=verb, tense=tense):
                    result = generate_practice(GenerateRequest(verb=verb, family="deuxieme-groupe", tense=tense))
                    self.assertEqual(result["total"], 20)
                    self.assertEqual({q["tense"] for q in result["questions"]}, {tense})



    def test_mixed_second_group_practice_uses_sixty_forty_ratio(self):
        from backend.main import second_group_pronominal_verbs
        result = generate_practice(GenerateRequest(family="deuxieme-groupe", tense="present"))
        verbs = [question["verb"] for question in result["questions"]]
        pronominal = set(second_group_pronominal_verbs())
        self.assertEqual(len(verbs), 20)
        self.assertEqual(len(set(verbs)), 20)
        self.assertEqual(sum(verb in pronominal for verb in verbs), 8)
        self.assertEqual(sum(verb not in pronominal for verb in verbs), 12)

    def test_random_second_group_uses_distinct_non_pronominal_verbs(self):
        from backend.main import SESSIONS, second_group_verbs
        available = set(second_group_verbs())
        result = generate_practice(GenerateRequest(family="deuxieme-groupe", tense="present", construction="non-pronominal"))
        verbs = [q["verb"] for q in result["questions"]]
        self.assertEqual(len(verbs), 20)
        self.assertEqual(len(set(verbs)), 20)
        self.assertTrue(set(verbs).issubset(available))
        self.assertEqual(len(SESSIONS[result["session_id"]]), 20)



    def test_all_added_pronominal_variants_have_compound_forms(self):
        from backend.main import second_group_forms
        expected = {
            "s'accroupir": "accroupi",
            "se blottir": "blotti",
            "s'enorgueillir": "enorgueilli",
            "se pourrir": "pourri",
            "se tapir": "tapi",
            "s'ébaubir": "ébaubi",
        }
        for verb, participle in expected.items():
            with self.subTest(verb=verb):
                forms = second_group_forms(verb, "passe-compose")
                self.assertEqual(len(forms), 9)
                self.assertTrue(all(any(row["form"].endswith(participle + ending) for ending in ("", "e", "s", "es")) for row in forms))
                self.assertTrue(all("suis" in row["form"] or "es " in row["form"] or "est " in row["form"] or "sommes" in row["form"] or "êtes" in row["form"] or "sont" in row["form"] for row in forms))

    def test_second_group_auxiliary_filter_is_enforced(self):
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="finir", family="deuxieme-groupe", tense="passe-compose", auxiliary="etre"))
        with self.assertRaises(HTTPException):
            generate_practice(GenerateRequest(verb="s'évanouir", family="deuxieme-groupe", tense="passe-compose", auxiliary="avoir"))

    def test_impersonal_pronominal_verb_is_rejected_for_individual_practice(self):
        for tense in ("present", "passe-compose", "imperatif-present", "imperatif-passe"):
            with self.subTest(tense=tense), self.assertRaises(HTTPException) as context:
                generate_practice(GenerateRequest(
                    verb="s'agir", family="deuxieme-groupe", tense=tense
                ))
            self.assertEqual(context.exception.status_code, 422)
            self.assertIn("práctica individual", str(context.exception.detail))

    def test_impersonal_verb_remains_available_in_random_second_group_practice(self):
        from unittest.mock import patch
        from backend.main import SESSIONS, second_group_pronominal_verbs

        self.assertIn("s'agir", second_group_pronominal_verbs())

        def sample_including_s_agir(population, k):
            population = list(population)
            if "s'agir" in population:
                return ["s'agir"] + [verb for verb in population if verb != "s'agir"][:k - 1]
            return population[:k]

        with patch("backend.main.random.sample", side_effect=sample_including_s_agir):
            result = generate_practice(GenerateRequest(
                family="deuxieme-groupe", tense="present"
            ))

        questions = SESSIONS[result["session_id"]]
        agir_questions = [row for row in questions if row["verb"] == "s'agir"]
        self.assertEqual(len(agir_questions), 1)
        self.assertEqual(agir_questions[0]["person"], "il")
        self.assertEqual(agir_questions[0]["answer"], "s'agit")

    def test_impersonal_verb_is_filtered_from_random_imperative_practice(self):
        from backend.main import SESSIONS

        for tense in ("imperatif-present", "imperatif-passe"):
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(
                    family="deuxieme-groupe", tense=tense
                ))
                questions = SESSIONS[result["session_id"]]
                self.assertEqual(len(questions), 20)
                self.assertNotIn("s'agir", {row["verb"] for row in questions})
                self.assertEqual(len({row["verb"] for row in questions}), 20)


    def test_neiger_is_rejected_for_individual_practice_in_every_tense(self):
        from backend.main import TENSE_LABELS

        for tense in TENSE_LABELS:
            with self.subTest(tense=tense), self.assertRaises(HTTPException) as context:
                generate_practice(GenerateRequest(verb="neiger", tense=tense))
            self.assertEqual(context.exception.status_code, 422)
            self.assertIn("verbo impersonal", str(context.exception.detail))
            self.assertIn("práctica individual", str(context.exception.detail))

    def test_neiger_impersonal_forms_use_only_il_and_canonical_participle(self):
        from backend.main import impersonal_er_forms, regular_first_group_verbs

        self.assertIn("neiger", regular_first_group_verbs())
        cases = {
            "present": ("il", "neige"),
            "imparfait": ("il", "neigeait"),
            "passe-simple": ("il", "neigea"),
            "futur-simple": ("il", "neigera"),
            "conditionnel-present": ("il", "neigerait"),
            "subjonctif-present": ("qu'il", "neige"),
            "subjonctif-imparfait": ("qu'il", "neigeât"),
            "passe-compose": ("il", "a neigé"),
            "plus-que-parfait": ("il", "avait neigé"),
            "passe-anterieur": ("il", "eut neigé"),
            "futur-anterieur": ("il", "aura neigé"),
            "conditionnel-passe": ("il", "aurait neigé"),
            "subjonctif-passe": ("qu'il", "ait neigé"),
            "subjonctif-plus-que-parfait": ("qu'il", "eût neigé"),
        }
        for tense, expected in cases.items():
            with self.subTest(tense=tense):
                forms = impersonal_er_forms("neiger", tense)
                self.assertEqual(len(forms), 1)
                self.assertEqual((forms[0]["person"], forms[0]["form"]), expected)

        for tense in ("imperatif-present", "imperatif-passe"):
            with self.subTest(tense=tense), self.assertRaises(HTTPException):
                impersonal_er_forms("neiger", tense)

    def test_neiger_can_appear_once_in_random_first_group_practice(self):
        from unittest.mock import patch
        from backend.main import SESSIONS

        def sample_including_neiger(population, k):
            population = list(population)
            if "neiger" in population:
                return ["neiger"] + [verb for verb in population if verb != "neiger"][:k - 1]
            return population[:k]

        with patch("backend.main.random.sample", side_effect=sample_including_neiger):
            result = generate_practice(GenerateRequest(
                family="premier-groupe-reguliers", tense="present"
            ))

        questions = SESSIONS[result["session_id"]]
        neiger_questions = [row for row in questions if row["verb"] == "neiger"]
        self.assertEqual(len(neiger_questions), 1)
        self.assertEqual(neiger_questions[0]["person"], "il")
        self.assertEqual(neiger_questions[0]["answer"], "neige")

    def test_neiger_is_excluded_from_random_first_group_imperative_practice(self):
        from backend.main import SESSIONS

        for tense in ("imperatif-present", "imperatif-passe"):
            with self.subTest(tense=tense):
                result = generate_practice(GenerateRequest(
                    family="premier-groupe-reguliers", tense=tense
                ))
                questions = SESSIONS[result["session_id"]]
                self.assertEqual(len(questions), 20)
                self.assertNotIn("neiger", {row["verb"] for row in questions})


if __name__ == "__main__":
    unittest.main()
