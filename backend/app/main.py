from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.conjugation_engine import ConjugationEngine
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

    return app


app = create_app()
