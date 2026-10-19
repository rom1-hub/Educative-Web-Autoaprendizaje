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

    def test_rejects_unimplemented_tense_with_clear_message(self):
        with self.assertRaises(HTTPException) as context:
            generate_practice(GenerateRequest(verb="parler", tense="passe-compose"))
        self.assertIn("présent", context.exception.detail)


if __name__ == "__main__":
    unittest.main()
