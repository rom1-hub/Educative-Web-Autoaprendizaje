from __future__ import annotations

import random
from typing import Any

from app.core.conjugation_engine import ConjugationEngine
from app.database.models import Verb
from app.modules.conjugation.repository import ConjugationRepository


PRONOUNS: tuple[str, ...] = (
    "je",
    "tu",
    "il/elle",
    "nous",
    "vous",
    "ils/elles",
)

REFLEXIVE_PRONOUNS: dict[str, str] = {
    "je": "me",
    "tu": "te",
    "il/elle": "se",
    "nous": "nous",
    "vous": "vous",
    "ils/elles": "se",
}

ELISION_INITIALS = frozenset("aeiouyhàâäéèêëîïôöùûüÿœæ")


class ExerciseService:
    """Generates random conjugation exercise sets from the canonical backend data."""

    def __init__(self, repository: ConjugationRepository):
        self.repository = repository
        self.engine = ConjugationEngine(repository)

    def generate_exercise_set(
        self,
        groups: list[int],
        family_id: str | None,
        tense_ids: list[str],
        verb_id: str | None = None,
        pronominal: bool | None = None,
        auxiliary: str | None = None,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        self._validate_inputs(
            groups=groups,
            tense_ids=tense_ids,
            limit=limit,
        )

        normalized_groups = list(dict.fromkeys(groups))
        normalized_tenses = list(dict.fromkeys(tense_ids))
        for tense_id in normalized_tenses:
            self.repository.get_tense_rule(tense_id)

        candidates = self._get_candidates(
            groups=normalized_groups,
            family_id=family_id,
            verb_id=verb_id,
            pronominal=pronominal,
            auxiliary=auxiliary,
        )

        if verb_id is not None:
            return self._generate_for_specific_verb(
                verb=candidates[0],
                tense_ids=normalized_tenses,
                limit=limit,
            )

        if len(candidates) < limit:
            raise ValueError(
                f"No hay suficientes verbos disponibles para generar "
                f"{limit} preguntas. Disponibles: {len(candidates)}."
            )

        selected_verbs = candidates[:]
        random.shuffle(selected_verbs)
        selected_verbs = selected_verbs[:limit]

        assigned_tenses = self._distribute_tenses(
            tense_ids=normalized_tenses,
            limit=limit,
        )

        questions = [
            self._build_question(
                verb=verb,
                tense_id=tense_id,
            )
            for verb, tense_id in zip(selected_verbs, assigned_tenses)
        ]

        random.shuffle(questions)
        return questions

    def _generate_for_specific_verb(
        self,
        *,
        verb: Verb,
        tense_ids: list[str],
        limit: int,
    ) -> list[dict[str, Any]]:
        assigned_tenses = self._distribute_tenses(
            tense_ids=tense_ids,
            limit=limit,
        )

        questions: list[dict[str, Any]] = []
        for index, tense_id in enumerate(assigned_tenses):
            pronoun_index = index % len(PRONOUNS)
            questions.append(
                self._build_question(
                    verb=verb,
                    tense_id=tense_id,
                    pronoun_index=pronoun_index,
                )
            )

        random.shuffle(questions)
        return questions

    def _build_question(
        self,
        *,
        verb: Verb,
        tense_id: str,
        pronoun_index: int | None = None,
    ) -> dict[str, Any]:
        if pronoun_index is None:
            pronoun_index = random.randrange(len(PRONOUNS))

        pronoun = PRONOUNS[pronoun_index]
        result = self.engine.conjugate_verb(
            verb_id=verb.id,
            tense_id=tense_id,
        )
        correct_answer = self._resolve_answer(
            legacy_forms=result["legacy_forms"],
            pronoun_index=pronoun_index,
            pronoun=pronoun,
        )

        if verb.pronominal:
            correct_answer = self._add_reflexive_pronoun(
                conjugated_form=correct_answer,
                pronoun=pronoun,
            )

        return {
            "verb_id": verb.id,
            "infinitif": verb.infinitif,
            "translation": self._get_translation(verb),
            "group": verb.groupe,
            "family_id": verb.familyId,
            "pattern_id": verb.patternId,
            "pronominal": verb.pronominal,
            "auxiliary": verb.auxiliaire,
            "tense_id": result["tense_rule"].id,
            "pronoun_index": pronoun_index,
            "pronoun": pronoun,
            "correct_answer": correct_answer,
        }

    def _get_candidates(
        self,
        *,
        groups: list[int],
        family_id: str | None,
        verb_id: str | None,
        pronominal: bool | None,
        auxiliary: str | None,
    ) -> list[Verb]:
        if verb_id is not None:
            verb = self.repository.get_verb(verb_id)
            self._validate_verb_filters(
                verb=verb,
                groups=groups,
                family_id=family_id,
                pronominal=pronominal,
                auxiliary=auxiliary,
            )
            return [verb]

        candidates = [
            verb
            for verb in self.repository.list_verbs()
            if verb.groupe in groups
            and (family_id is None or verb.familyId == family_id)
            and (pronominal is None or verb.pronominal is pronominal)
            and (
                auxiliary is None
                or verb.auxiliaire == auxiliary
                or auxiliary in verb.auxiliaires
            )
        ]

        if not candidates:
            filters = [f"grupos {groups}"]
            if family_id is not None:
                filters.append(f"familia '{family_id}'")
            if pronominal is not None:
                filters.append(
                    "verbos pronominales"
                    if pronominal
                    else "verbos no pronominales"
                )
            if auxiliary is not None:
                filters.append(f"auxiliar '{auxiliary}'")
            raise ValueError(
                "No hay verbos disponibles para " + " y ".join(filters) + "."
            )

        return candidates

    @staticmethod
    def _validate_verb_filters(
        *,
        verb: Verb,
        groups: list[int],
        family_id: str | None,
        pronominal: bool | None,
        auxiliary: str | None,
    ) -> None:
        if verb.groupe not in groups:
            raise ValueError(
                f"El verbo '{verb.id}' pertenece al grupo {verb.groupe} "
                f"y no coincide con los grupos solicitados {groups}."
            )

        if family_id is not None and verb.familyId != family_id:
            raise ValueError(
                f"El verbo '{verb.id}' pertenece a la familia "
                f"'{verb.familyId}', no a '{family_id}'."
            )

        if pronominal is not None and verb.pronominal is not pronominal:
            expected = "pronominal" if pronominal else "no pronominal"
            raise ValueError(
                f"El verbo '{verb.id}' no cumple el filtro '{expected}'."
            )

        if (
            auxiliary is not None
            and verb.auxiliaire != auxiliary
            and auxiliary not in verb.auxiliaires
        ):
            raise ValueError(
                f"El verbo '{verb.id}' no coincide con el auxiliar '{auxiliary}'."
            )

    @staticmethod
    def _distribute_tenses(
        *,
        tense_ids: list[str],
        limit: int,
    ) -> list[str]:
        if not tense_ids:
            raise ValueError("Debe indicarse al menos un tiempo verbal.")

        base_quota, remainder = divmod(limit, len(tense_ids))
        assigned: list[str] = []

        order = tense_ids[:]
        random.shuffle(order)

        for index, tense_id in enumerate(order):
            quota = base_quota + (1 if index < remainder else 0)
            assigned.extend([tense_id] * quota)

        random.shuffle(assigned)
        return assigned

    @staticmethod
    def _add_reflexive_pronoun(
        *,
        conjugated_form: str,
        pronoun: str,
    ) -> str:
        form = conjugated_form.strip()
        if not form:
            raise ValueError("La forma conjugada no puede estar vacía.")

        reflexive = REFLEXIVE_PRONOUNS.get(pronoun)
        if reflexive is None:
            raise ValueError(
                f"No existe pronombre reflexivo para '{pronoun}'."
            )

        if reflexive in {"me", "te", "se"} and ExerciseService._starts_with_elision_sound(form):
            elided = {"me": "m'", "te": "t'", "se": "s'"}[reflexive]
            return f"{elided}{form}"

        return f"{reflexive} {form}"

    @staticmethod
    def _starts_with_elision_sound(form: str) -> bool:
        first = form.lstrip().lower()[:1]
        return bool(first and first in ELISION_INITIALS)

    @staticmethod
    def _resolve_answer(
        *,
        legacy_forms: dict[str, Any] | list[Any] | None,
        pronoun_index: int,
        pronoun: str,
    ) -> str:
        if legacy_forms is None:
            raise ValueError(
                "El motor Python todavía no puede resolver la conjugación "
                f"para el pronombre '{pronoun}'."
            )

        value: Any
        if isinstance(legacy_forms, list):
            if pronoun_index >= len(legacy_forms):
                raise ValueError(
                    f"No existe la forma para el pronombre '{pronoun}' "
                    "en _legacy_formes."
                )
            value = legacy_forms[pronoun_index]
        else:
            keys = (
                pronoun,
                pronoun.replace("/", " / "),
                str(pronoun_index),
                str(pronoun_index + 1),
            )
            value = next(
                (legacy_forms[key] for key in keys if key in legacy_forms),
                None,
            )
            if value is None:
                raise ValueError(
                    f"No existe la forma para el pronombre '{pronoun}' "
                    "en _legacy_formes."
                )

        if isinstance(value, str):
            return value

        if isinstance(value, dict):
            for key in ("forme", "form", "value", "conjugaison", "conjugation"):
                nested = value.get(key)
                if isinstance(nested, str):
                    return nested

        raise ValueError(
            f"Formato de conjugación no soportado para '{pronoun}'."
        )

    @staticmethod
    def _get_translation(verb: Verb) -> str | None:
        if not verb.source:
            return None

        translation = verb.source.get("translation")
        return translation if isinstance(translation, str) else None

    @staticmethod
    def _validate_inputs(
        *,
        groups: list[int],
        tense_ids: list[str],
        limit: int,
    ) -> None:
        if not groups:
            raise ValueError("Debe indicarse al menos un grupo verbal.")

        invalid_groups = [group for group in groups if group not in (1, 2, 3)]
        if invalid_groups:
            raise ValueError(
                f"Grupos inválidos: {invalid_groups}. Use 1, 2 o 3."
            )

        if not tense_ids:
            raise ValueError("Debe indicarse al menos un tiempo verbal.")

        if limit < 1:
            raise ValueError("El límite debe ser mayor o igual que 1.")
