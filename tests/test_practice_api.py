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

    def test_rejects_spelling_change_families_for_now(self):
        for verb in ("manger", "placer", "appeler", "payer", "aller", "lever"):
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
