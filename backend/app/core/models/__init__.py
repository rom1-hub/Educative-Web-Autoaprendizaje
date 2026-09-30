# Backward-compatible imports.
# The canonical Pydantic models live in app.database.models.

from app.database.models import Family, Pattern, TenseRule, Verb

__all__ = [
    "Verb",
    "Family",
    "Pattern",
    "TenseRule",
]
