import unittest

from backend import main


class EtrePriorityPracticeTests(unittest.TestCase):
    compound_tenses = {
        "passe-compose": {
            "je": "suis", "tu": "es", "il": "est", "elle": "est", "on": "est",
            "nous": "sommes", "vous": "êtes", "ils": "sont", "elles": "sont",
        },
        "plus-que-parfait": {
            "je": "étais", "tu": "étais", "il": "était", "elle": "était", "on": "était",
            "nous": "étions", "vous": "étiez", "ils": "étaient", "elles": "étaient",
        },
        "passe-anterieur": {
            "je": "fus", "tu": "fus", "il": "fut", "elle": "fut", "on": "fut",
            "nous": "fûmes", "vous": "fûtes", "ils": "furent", "elles": "furent",
        },
        "futur-anterieur": {
            "je": "serai", "tu": "seras", "il": "sera", "elle": "sera", "on": "sera",
            "nous": "serons", "vous": "serez", "ils": "seront", "elles": "seront",
        },
        "conditionnel-passe": {
            "je": "serais", "tu": "serais", "il": "serait", "elle": "serait", "on": "serait",
            "nous": "serions", "vous": "seriez", "ils": "seraient", "elles": "seraient",
        },
        "subjonctif-passe": {
            "que je": "sois", "que tu": "sois", "qu'il": "soit", "qu'elle": "soit",
            "qu'on": "soit", "que nous": "soyons", "que vous": "soyez",
            "qu'ils": "soient", "qu'elles": "soient",
        },
        "subjonctif-plus-que-parfait": {
            "que je": "fusse", "que tu": "fusses", "qu'il": "fût", "qu'elle": "fût",
            "qu'on": "fût", "que nous": "fussions", "que vous": "fussiez",
            "qu'ils": "fussent", "qu'elles": "fussent",
        },
        "imperatif-passe": {
            "tu*": "sois", "nous*": "soyons", "vous*": "soyez",
        },
    }

    expected_participles = {
        "monter": "mont",
        "passer": "pass",
        "retourner": "retourn",
    }

    def test_priority_verbs_use_etre_even_if_client_sends_avoir_and_group_three(self):
        for verb, participle_stem in self.expected_participles.items():
            for tense, auxiliary_by_person in self.compound_tenses.items():
                with self.subTest(verb=verb, tense=tense):
                    result = main.generate_practice(main.GenerateRequest(
                        verb=verb,
                        tense=tense,
                        family="troisieme-groupe",
                        construction="non-pronominal",
                        auxiliary="avoir",
                    ))
                    session = main.SESSIONS[result["session_id"]]
                    self.assertEqual(result["total"], 20)
                    self.assertEqual(len(session), 20)
                    expected_subjects = {
                        "je (masculin singulier)", "je (féminin singulier)",
                        "tu (masculin singulier)", "tu (féminin singulier)",
                        "il", "elle",
                        "on (impersonnel, masculin singulier)",
                        "on (masculin pluriel)", "on (féminin pluriel)",
                        "nous (masculin pluriel)", "nous (féminin pluriel)",
                        "vous (masculin singulier)", "vous (féminin singulier)",
                        "vous (masculin pluriel)", "vous (féminin pluriel)",
                        "ils", "elles",
                    }
                    self.assertEqual({question["person"] for question in session}, expected_subjects)
                    for question in session:
                        person = question["person_key"]
                        expected_auxiliary = auxiliary_by_person[person]
                        answer = question["answer"]
                        self.assertTrue(
                            answer.startswith(expected_auxiliary + " "),
                            f"{verb}/{tense}/{person}: auxiliar inesperado en {answer!r}",
                        )
                        self.assertNotRegex(
                            answer,
                            r"^(?:ai|as|a|avons|avez|ont|avais|avait|avions|aviez|avaient) ",
                        )
                        gender = question["subject_gender"]
                        number = question["subject_number"]
                        ending = "e" if gender == "féminin" and number == "singulier" else "es" if gender == "féminin" and number == "pluriel" else "s" if gender == "masculin" and number == "pluriel" else ""
                        expected_participle = participle_stem + "é" + ending
                        self.assertTrue(
                            answer.endswith(expected_participle),
                            f"{verb}/{tense}/{person}: participio esperado {expected_participle!r}, obtenido {answer!r}",
                        )

    def test_wrong_participle_agreement_is_rejected_for_explicit_context(self):
        result = main.generate_practice(main.GenerateRequest(
            verb="monter",
            tense="passe-compose",
            family="",
            construction="non-pronominal",
            auxiliary="etre",
        ))
        session = main.SESSIONS[result["session_id"]]
        index = next(
            i for i, question in enumerate(session)
            if question["person"] == "je (féminin singulier)"
        )
        correct = main.check_answer(main.CheckRequest(
            session_id=result["session_id"],
            index=index,
            answer="suis montée",
        ))
        incorrect = main.check_answer(main.CheckRequest(
            session_id=result["session_id"],
            index=index,
            answer="suis monté",
        ))
        self.assertTrue(correct["correct"])
        self.assertFalse(incorrect["correct"])

    def test_simple_tense_keeps_ordinary_conjugation(self):
        expected = {
            "monter": "monte",
            "passer": "passe",
            "retourner": "retourne",
        }
        for verb, form in expected.items():
            with self.subTest(verb=verb):
                rows = main.regular_er_forms(verb, "present")
                by_person = {row["person"]: row["form"] for row in rows}
                self.assertEqual(by_person["je"], form)
                self.assertEqual(by_person["nous"], verb[:-2] + "ons")

    def test_generated_answer_is_accepted_by_check_endpoint(self):
        result = main.generate_practice(main.GenerateRequest(
            verb="monter",
            tense="passe-compose",
            family="",
            construction="non-pronominal",
            auxiliary="avoir",
        ))
        question = main.SESSIONS[result["session_id"]][0]
        checked = main.check_answer(main.CheckRequest(
            session_id=result["session_id"],
            index=0,
            answer=question["answer"],
        ))
        self.assertTrue(checked["correct"])
        self.assertEqual(checked["expected"], question["answer"])


if __name__ == "__main__":
    unittest.main()
