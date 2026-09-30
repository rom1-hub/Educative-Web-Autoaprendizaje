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


class ExerciseService:
    """Generates balanced random conjugation exercise sets."""

    def __init__(self, repository: ConjugationRepository):
        self.repository = repository
        self.engine = ConjugationEngine(repository)

    def generate_exercise_set(
        self,
        groups: list[int],
        family_id: str | None,
        tense_id: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        self._validate_inputs(groups=groups, limit=limit)

        normalized_groups = list(dict.fromkeys(groups))
        candidates_by_group = self._get_candidates_by_group(
            groups=normalized_groups,
            family_id=family_id,
        )

        total_available = sum(
            len(candidates)
            for candidates in candidates_by_group.values()
        )
        if total_available < limit:
            raise ValueError(
                f"No hay suficientes verbos disponibles para generar "
                f"{limit} preguntas. Disponibles: {total_available}."
            )

        selected_verbs = self._select_balanced(
            candidates_by_group=candidates_by_group,
            limit=limit,
        )

        questions: list[dict[str, Any]] = []
        for verb in selected_verbs:
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

            questions.append(
                {
                    "verb_id": verb.id,
                    "infinitif": verb.infinitif,
                    "translation": self._get_translation(verb),
                    "group": verb.groupe,
                    "auxiliary": verb.auxiliaire,
                    "tense_id": result["tense_rule"].id,
                    "pronoun_index": pronoun_index,
                    "pronoun": pronoun,
                    "correct_answer": correct_answer,
                }
            )

        return questions

    def _get_candidates_by_group(
        self,
        *,
        groups: list[int],
        family_id: str | None,
    ) -> dict[int, list[Verb]]:
        candidates = [
            verb
            for verb in self.repository.list_verbs()
            if verb.groupe in groups
            and (family_id is None or verb.familyId == family_id)
        ]

        grouped = {group: [] for group in groups}
        for verb in candidates:
            grouped[verb.groupe].append(verb)

        if not candidates:
            family_detail = (
                f" y familia '{family_id}'"
                if family_id is not None
                else ""
            )
            raise ValueError(
                f"No hay verbos disponibles para los grupos "
                f"{groups}{family_detail}."
            )

        return grouped

    @staticmethod
    def _select_balanced(
        *,
        candidates_by_group: dict[int, list[Verb]],
        limit: int,
    ) -> list[Verb]:
        groups = list(candidates_by_group)
        for candidates in candidates_by_group.values():
            random.shuffle(candidates)

        base_quota, remainder = divmod(limit, len(groups))
        quotas = {
            group: base_quota + (index < remainder)
            for index, group in enumerate(groups)
        }

        selected: list[Verb] = []
        remaining_slots = 0

        for group in groups:
            available = len(candidates_by_group[group])
            take = min(quotas[group], available)
            selected.extend(candidates_by_group[group][:take])
            remaining_slots += quotas[group] - take

        if remaining_slots:
            remaining_candidates = [
                verb
                for group in groups
                for verb in candidates_by_group[group][quotas[group]:]
            ]
            random.shuffle(remaining_candidates)
            selected.extend(remaining_candidates[:remaining_slots])

        random.shuffle(selected)
        return selected

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
    def _validate_inputs(*, groups: list[int], limit: int) -> None:
        if not groups:
            raise ValueError("Debe indicarse al menos un grupo verbal.")

        invalid_groups = [group for group in groups if group not in (1, 2, 3)]
        if invalid_groups:
            raise ValueError(
                f"Grupos inválidos: {invalid_groups}. Use 1, 2 o 3."
            )

        if limit < 1:
            raise ValueError("El límite debe ser mayor o igual que 1.")
