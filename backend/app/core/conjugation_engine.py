from __future__ import annotations

from dataclasses import dataclass

from app.core.models import Family, Pattern, TenseRule, Verb
from app.modules.conjugation.repository import ConjugationRepository


@dataclass(frozen=True)
class ConjugationResult:
    verb_id: str
    infinitif: str
    tense: str
    person: str
    form: str
    source: str


class ConjugationEngine:
    """Orchestrates conjugation resolution.

    The actual pattern algorithms will be introduced incrementally.
    Until then, _legacy_formes provides a controlled migration fallback.
    """

    def __init__(self, repository: ConjugationRepository):
        self.repository = repository

    def conjugate(
        self,
        verb_id: str,
        tense_id: str,
        person: str,
    ) -> ConjugationResult:
        verb = self.repository.get_verb(verb_id)
        family = self.repository.get_family(verb.familyId)
        pattern = self.repository.get_pattern(family.patternId)
        tense_rule = self.repository.get_tense_rule(tense_id)

        form, source = self._resolve(
            verb=verb,
            family=family,
            pattern=pattern,
            tense_rule=tense_rule,
            person=person,
        )

        return ConjugationResult(
            verb_id=verb.id,
            infinitif=verb.infinitif,
            tense=tense_rule.id,
            person=person,
            form=form,
            source=source,
        )

    def _resolve(
        self,
        *,
        verb: Verb,
        family: Family,
        pattern: Pattern,
        tense_rule: TenseRule,
        person: str,
    ) -> tuple[str, str]:
        python_result = self._resolve_python(
            verb=verb,
            family=family,
            pattern=pattern,
            tense_rule=tense_rule,
            person=person,
        )

        if python_result is not None:
            return python_result, "python"

        legacy_result = self._resolve_legacy(
            verb=verb,
            tense_rule=tense_rule,
            person=person,
        )

        if legacy_result is not None:
            return legacy_result, "legacy"

        raise ValueError(
            f"No se pudo conjugar '{verb.id}' en "
            f"'{tense_rule.id}' para '{person}'."
        )

    def _resolve_python(
        self,
        *,
        verb: Verb,
        family: Family,
        pattern: Pattern,
        tense_rule: TenseRule,
        person: str,
    ) -> str | None:
        """Future entry point for the real Python pattern resolver."""
        return None

    def _resolve_legacy(
        self,
        *,
        verb: Verb,
        tense_rule: TenseRule,
        person: str,
    ) -> str | None:
        legacy_formes = verb.legacy_formes

        if not legacy_formes:
            return None

        tense = legacy_formes.get(tense_rule.id)

        if not isinstance(tense, dict):
            return None

        value = tense.get(person)

        return value if isinstance(value, str) else None
