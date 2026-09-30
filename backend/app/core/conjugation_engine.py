from __future__ import annotations

from typing import Any

from app.database.models import Family, Pattern, TenseRule, Verb
from app.modules.conjugation.repository import ConjugationRepository


class ConjugationEngine:
    """Initial regression-safe conjugation engine."""

    def __init__(self, repository: ConjugationRepository):
        self.repository = repository

    def conjugate_verb(
        self,
        verb_id: str,
        tense_id: str,
    ) -> dict[str, Any]:
        verb = self.repository.get_verb(verb_id)
        family = self.repository.get_family(verb.familyId)
        pattern = self.repository.get_pattern(verb.patternId)
        tense_rule = self.repository.get_tense_rule(tense_id)

        legacy_forms = self._get_legacy_forms(
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

    def _get_legacy_forms(
        self,
        *,
        verb: Verb,
        tense_rule: TenseRule,
    ) -> dict[str, Any] | list[Any] | None:
        if not verb.legacy_formes:
            return None

        forms = verb.legacy_formes.get(tense_rule.id)
        if forms is None:
            return None

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
        family = self.repository.get_family(verb.familyId)
        pattern = self.repository.get_pattern(verb.patternId)
        return family, pattern
