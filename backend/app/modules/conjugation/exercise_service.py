from __future__ import annotations

import random
from typing import Any

from app.core.conjugation_engine import ConjugationEngine
from app.core.morphology import (
    ELISION_INITIALS,
    add_reflexive_pronoun,
    starts_with_elision_sound,
)
from app.database.models import TenseRule, Verb
from app.modules.conjugation.repository import ConjugationRepository
from app.core.subjects import (
    SIMPLE_SUBJECTS,
    Subject,
    subjects_for_tense,
)


PRONOUNS: tuple[str, ...] = tuple(
    subject.pronoun for subject in SIMPLE_SUBJECTS
)

REFLEXIVE_PRONOUNS: dict[str, str] = {
    "je": "me",
    "tu": "te",
    "il": "se",
    "elle": "se",
    "on": "se",
    "nous": "nous",
    "vous": "vous",
    "ils": "se",
    "elles": "se",
}



class ExerciseService:
    """Generates exercise sets from canonical data and legacy regression forms."""

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
            tense_ids=normalized_tenses,
        )

        if verb_id is not None:
            return self._generate_for_specific_verb(
                verb=candidates[0],
                tense_ids=normalized_tenses,
                auxiliary=auxiliary,
                limit=limit,
            )

        if len(candidates) < limit:
            raise ValueError(
                f"No hay suficientes verbos disponibles para generar "
                f"{limit} preguntas. Disponibles: {len(candidates)}."
            )

        selected_verbs = self._select_verbs_balanced_by_group(
            candidates=candidates,
            groups=normalized_groups,
            limit=limit,
        )

        assigned_tenses = self._distribute_tenses(
            tense_ids=normalized_tenses,
            limit=limit,
        )

        questions = [
            self._build_question(
                verb=verb,
                tense_id=tense_id,
                auxiliary=auxiliary,
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
        auxiliary: str | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        assigned_tenses = self._distribute_tenses(
            tense_ids=tense_ids,
            limit=limit,
        )
        questions: list[dict[str, Any]] = []

        for index, tense_id in enumerate(assigned_tenses):
            subjects = self._valid_subjects(tense_id)
            subject = subjects[index % len(subjects)]
            questions.append(
                self._build_question(
                    verb=verb,
                    tense_id=tense_id,
                    subject=subject,
                    auxiliary=auxiliary,
                )
            )

        random.shuffle(questions)
        return questions

    def _build_question(
        self,
        *,
        verb: Verb,
        tense_id: str,
        subject: Subject | None = None,
        auxiliary: str | None = None,
    ) -> dict[str, Any]:
        if subject is None:
            subject = random.choice(self._valid_subjects(tense_id))

        correct_answer = self.engine.conjugate_subject(
            verb_id=verb.id,
            tense_id=tense_id,
            subject=subject,
            auxiliary=auxiliary,
        )

        if verb.pronominal:
            correct_answer = add_reflexive_pronoun(
                conjugated_form=correct_answer,
                pronoun=subject.pronoun,
                tense_id=tense_id,
            )

        result = self.engine.conjugate_verb(
            verb_id=verb.id,
            tense_id=tense_id,
            auxiliary=auxiliary,
        )

        return {
            "verb_id": verb.id,
            "infinitif": verb.infinitif,
            "translation": self._get_translation(verb),
            "group": verb.groupe,
            "family_id": verb.familyId,
            "pattern_id": verb.patternId,
            "pronominal": verb.pronominal,
            "auxiliary": auxiliary or verb.auxiliaire,
            "tense_id": result["tense_rule"].id,
            "pronoun_index": subject.legacy_index,
            "pronoun": subject.display,
            "subject_id": subject.id,
            "subject_pronoun": subject.pronoun,
            "gender": subject.gender,
            "number": subject.number,
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
        tense_ids: list[str],
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
            if not self._supports_tenses(verb=verb, tense_ids=tense_ids, auxiliary=auxiliary):
                raise ValueError(
                    f"El verbo '{verb.id}' no puede resolver los tiempos solicitados."
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
            and self._supports_tenses(
                verb=verb,
                tense_ids=tense_ids,
                auxiliary=auxiliary,
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

    def _supports_tenses(
        self,
        *,
        verb: Verb,
        tense_ids: list[str],
        auxiliary: str | None = None,
    ) -> bool:
        if not verb.legacy_formes:
            return False

        for tense_id in tense_ids:
            tense_rule = self.repository.get_tense_rule(tense_id)

            if tense_rule.type == "composé":
                if not isinstance(verb.participePasse, str) or not verb.participePasse.strip():
                    return False

                auxiliaries = verb.auxiliaires or (
                    [verb.auxiliaire] if verb.auxiliaire else []
                )
                selected = auxiliary or verb.auxiliaire
                if selected not in auxiliaries:
                    return False

                auxiliary_verb = self.repository.get_verb(selected)
                auxiliary_forms = auxiliary_verb.legacy_formes or {}
                if tense_rule.auxiliaireTemps not in auxiliary_forms:
                    return False

                if not self._has_usable_forms(auxiliary_forms[tense_rule.auxiliaireTemps]):
                    return False
                continue

            if not self._has_usable_forms(verb.legacy_formes.get(tense_id)):
                return False

        return True

    @staticmethod
    def _has_usable_forms(forms: Any) -> bool:
        if isinstance(forms, list):
            usable = 0
            for value in forms:
                try:
                    ConjugationEngine.extract_answer_form(value)
                    usable += 1
                except ValueError:
                    continue
            return usable > 0

        if isinstance(forms, dict):
            return any(
                isinstance(value, str) and value.strip()
                for value in forms.values()
            )

        return False

    @staticmethod
    def _select_verbs_balanced_by_group(
        *,
        candidates: list[Verb],
        groups: list[int],
        limit: int,
    ) -> list[Verb]:
        pools: dict[int, list[Verb]] = {group: [] for group in groups}
        for verb in candidates:
            pools.setdefault(verb.groupe, []).append(verb)

        active_groups = [group for group in groups if pools.get(group)]
        if not active_groups:
            return []

        for pool in pools.values():
            random.shuffle(pool)
        random.shuffle(active_groups)

        selected: list[Verb] = []
        while len(selected) < limit:
            progressed = False
            for group in active_groups:
                pool = pools[group]
                if pool:
                    selected.append(pool.pop())
                    progressed = True
                    if len(selected) == limit:
                        break

            if not progressed:
                break

        return selected

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

    def _valid_subjects(self, tense_id: str) -> tuple[Subject, ...]:
        tense_rule = self.repository.get_tense_rule(tense_id)
        return subjects_for_tense(tense_rule.type, tense_id)

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

        if reflexive in {"me", "te", "se"} and starts_with_elision_sound(form):
            elided = {"me": "m'", "te": "t'", "se": "s'"}[reflexive]
            return f"{elided}{form}"

        return f"{reflexive} {form}"

    @staticmethod
    def _starts_with_elision_sound(form: str) -> bool:
        return starts_with_elision_sound(form)

    @staticmethod
    def _legacy_form_index(
        *,
        tense_id: str,
        pronoun_index: int,
    ) -> int:
        if tense_id == "impératif présent":
            mapping = {1: 0, 3: 1, 4: 2}
            try:
                return mapping[pronoun_index]
            except KeyError as exc:
                raise ValueError(
                    f"El pronombre '{PRONOUNS[pronoun_index]}' no tiene "
                    "forma propia en impératif présent."
                ) from exc

        return pronoun_index

    @staticmethod
    def _resolve_answer(
        *,
        legacy_forms: dict[str, Any] | list[Any] | None,
        pronoun_index: int,
        pronoun: str,
        form_index: int | None = None,
    ) -> str:
        if legacy_forms is None:
            raise ValueError(
                "El motor Python todavía no puede resolver la conjugación "
                f"para el pronombre '{pronoun}'."
            )

        value: Any
        if isinstance(legacy_forms, list):
            index = pronoun_index if form_index is None else form_index
            if index >= len(legacy_forms):
                raise ValueError(
                    f"No existe la forma para el pronombre '{pronoun}' "
                    "en _legacy_formes."
                )
            value = legacy_forms[index]
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

        try:
            return ConjugationEngine.extract_answer_form(value)
        except ValueError as exc:
            raise ValueError(
                f"Formato de conjugación no soportado para '{pronoun}'."
            ) from exc

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
