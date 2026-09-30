from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.core.conjugation_engine import ConjugationEngine
from app.modules.conjugation.exercise_service import ExerciseService
from app.modules.conjugation.repository import ConjugationRepository


BASE_DIR = Path(__file__).resolve().parents[2]
VERB_DATA_DIR = BASE_DIR / "data" / "verbs"


def create_app() -> FastAPI:
    app = FastAPI(
        title="COQ Backend",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    repository = ConjugationRepository(VERB_DATA_DIR)
    repository.load()
    engine = ConjugationEngine(repository)
    exercise_service = ExerciseService(repository)

    @app.get("/api/verbs/test/{verb_id}")
    def test_verb(verb_id: str, tense_id: str):
        try:
            result = engine.conjugate_verb(
                verb_id=verb_id,
                tense_id=tense_id,
            )
        except (KeyError, ValueError) as exc:
            raise HTTPException(
                status_code=404,
                detail=str(exc),
            ) from exc

        return {
            "verb": result["verb"].model_dump(
                by_alias=True,
                exclude={"legacy_formes"},
            ),
            "family": result["family"].model_dump(),
            "pattern": result["pattern"].model_dump(),
            "tense_rule": result["tense_rule"].model_dump(),
            "legacy_forms": result["legacy_forms"],
            "source": result["source"],
        }

    @app.get("/api/exercises/generate")
    def generate_exercise(
        groups: str = Query(
            ...,
            description='Grupos verbales separados por coma, por ejemplo "1,3" o "all".',
        ),
        family_id: str | None = Query(
            default=None,
            description="ID de familia verbal opcional.",
        ),
        tense_id: str = Query(
            ...,
            description="ID del tiempo verbal.",
        ),
        limit: int = Query(
            default=10,
            ge=1,
            description="Número de preguntas solicitadas.",
        ),
    ):
        try:
            parsed_groups = _parse_groups(groups)
            questions = exercise_service.generate_exercise_set(
                groups=parsed_groups,
                family_id=family_id,
                tense_id=tense_id,
                limit=limit,
            )
        except (KeyError, ValueError) as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        return {
            "questions": questions,
            "count": len(questions),
            "groups": parsed_groups,
            "family_id": family_id,
            "tense_id": tense_id,
            "limit": limit,
        }

    return app


def _parse_groups(value: str) -> list[int]:
    normalized = value.strip().lower()

    if normalized == "all":
        return [1, 2, 3]

    if not normalized:
        raise ValueError("Debe indicarse al menos un grupo verbal.")

    try:
        groups = [int(item.strip()) for item in value.split(",")]
    except ValueError as exc:
        raise ValueError(
            'El parámetro "groups" debe contener números separados por comas '
            'o el valor "all".'
        ) from exc

    if not groups:
        raise ValueError("Debe indicarse al menos un grupo verbal.")

    return groups


app = create_app()
