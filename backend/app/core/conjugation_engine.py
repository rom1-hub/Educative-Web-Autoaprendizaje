from __future__ import annotations

from typing import Any

from app.database.models import Family, Pattern, TenseRule, Verb
from app.modules.conjugation.repository import ConjugationRepository


class ConjugationEngine:
    """Regression-first conjugation engine with a legacy fallback path."""

    def __init__(self, repository: ConjugationRepository):
        self.repository = repository

    def conjugate_verb(
        self,
        verb_id: str,
        tense_id: str,
    ) -> dict[str, Any]:
        verb = self.repository.get_verb(verb_id)
        tense_rule = self.repository.get_tense_rule(tense_id)

        # Emergency path for verbs that are not yet assigned to a canonical
        # family/pattern. No pattern resolution or heuristic inference occurs.
        if verb.familyId is None:
            legacy_forms = self._resolve_legacy(
                verb=verb,
                tense_rule=tense_rule,
            )
            return {
                "verb": verb,
                "family": None,
                "pattern": None,
                "tense_rule": tense_rule,
                "legacy_forms": legacy_forms,
                "source": "legacy",
            }

        family = self.repository.get_family(verb.familyId)
        pattern = self.repository.get_pattern(verb.patternId)
        legacy_forms = self._resolve_legacy(
            verb=verb,
            tense_rule=tense_rule,
        )

        return {
            "verb": verb,
            "family": family,
            "pattern": pattern,
            "tense_rule": tense_rule,
            "legacy_forms": legacy_forms,
            "source": "legacy" if legacy_forms is not None else "python",
        }

    def _resolve_legacy(
        self,
        *,
        verb: Verb,
        tense_rule: TenseRule,
    ) -> dict[str, Any] | list[Any]:
        if not verb.legacy_formes:
            raise ValueError(
                f"El verbo '{verb.id}' no contiene '_legacy_formes'."
            )

        forms = verb.legacy_formes.get(tense_rule.id)
        if forms is None:
            raise ValueError(
                f"No existe una forma legacy para '{verb.id}' / "
                f"'{tense_rule.id}'."
            )

        if isinstance(forms, (dict, list)):
            return forms

        raise ValueError(
            f"Formato inválido en _legacy_formes para "
            f"'{verb.id}' / '{tense_rule.id}'."
        )

    def resolve_relationships(
        self,
        verb: Verb,
    ) -> tuple[Family, Pattern]:
        if verb.familyId is None or verb.patternId is None:
            raise ValueError(
                f"El verbo '{verb.id}' no tiene relaciones canónicas."
            )

        family = self.repository.get_family(verb.familyId)
        pattern = self.repository.get_pattern(verb.patternId)
        return family, pattern
