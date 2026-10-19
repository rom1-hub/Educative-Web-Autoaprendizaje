from __future__ import annotations

import random
import re
import uuid
import unicodedata
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = __import__("pathlib").Path(__file__).resolve().parents[1]
app = FastAPI(title="Coq — práctica de conjugación", version="0.1.0")

PERSONS = [
    ("je", "je"),
    ("tu", "tu"),
    ("il", "il"),
    ("elle", "elle"),
    ("on", "on"),
    ("nous", "nous"),
    ("vous", "vous"),
    ("ils", "ils"),
    ("elles", "elles"),
]
SESSIONS: dict[str, list[dict[str, str]]] = {}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFC", value or "").lower().replace("’", "'")
    return re.sub(r"\s+", " ", value.strip())


def regular_er_present(verb: str) -> list[dict[str, str]]:
    """First supported category: regular first-group verbs in présent."""
    lemma = normalize(verb)
    if not re.fullmatch(r"[a-zàâçéèêëîïôûùüÿœæ'-]+er", lemma):
        raise HTTPException(422, "Esta primera categoría solo admite infinitivos regulares en -ER.")
    if lemma == "aller" or re.search(r"(?:ger|cer|eler|eter|yer)$", lemma):
        raise HTTPException(422, "Este verbo pertenece a una familia con reglas particulares todavía no implementada.")
    if re.search(r"[eéèê][^aeiouyàâéèêëîïôûùüÿœæ]er$", lemma):
        raise HTTPException(422, "Este verbo pertenece a una familia con cambio ortográfico todavía no implementada.")

    stem = lemma[:-2]
    forms = [
        stem + "e",
        stem + "es",
        stem + "e",
        stem + "e",
        stem + "e",
        stem + "ons",
        stem + "ez",
        stem + "ent",
        stem + "ent",
    ]
    return [
        {"person": person, "form": form, "verb": lemma, "tense": "present"}
        for (person, _), form in zip(PERSONS, forms)
    ]


class GenerateRequest(BaseModel):
    verb: str = Field(min_length=1, max_length=80)
    tense: str = "present"
    family: str = ""
    construction: str = ""
    auxiliary: str = ""


class CheckRequest(BaseModel):
    session_id: str
    index: int = Field(ge=0, le=19)
    answer: str = Field(max_length=120)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "coq-practice-python"}


@app.post("/api/practice/generate")
def generate_practice(request: GenerateRequest) -> dict:
    if request.tense != "present":
        raise HTTPException(422, "La primera categoría implementada es el présent de l'indicatif.")
    if request.family not in ("", "premier-groupe-reguliers"):
        raise HTTPException(422, "Esta primera versión solo incluye los verbos regulares del primer grupo.")
    if request.construction not in ("", "non-pronominal"):
        raise HTTPException(422, "Esta primera categoría solo incluye verbos no pronominales.")
    if request.auxiliary not in ("", "avoir"):
        raise HTTPException(422, "El filtro de auxiliar no se aplica a esta categoría.")
    forms = regular_er_present(request.verb)
    pool = forms.copy()
    random.shuffle(pool)
    questions = []
    for index in range(20):
        form = pool[index % len(pool)]
        questions.append({
            "person": form["person"],
            "verb": form["verb"],
            "tense": form["tense"],
        })
    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = [
        {"person": item["person"], "verb": item["verb"], "tense": item["tense"],
         "answer": forms[ next(i for i, row in enumerate(forms) if row["person"] == item["person"]) ]["form"]}
        for item in questions
    ]
    return {
        "session_id": session_id,
        "total": len(questions),
        "questions": [{"index": i, **{k: v for k, v in item.items() if k != "answer"}}
                      for i, item in enumerate(SESSIONS[session_id])],
    }


@app.post("/api/practice/check")
def check_answer(request: CheckRequest) -> dict:
    questions = SESSIONS.get(request.session_id)
    if questions is None:
        raise HTTPException(404, "La sesión ha caducado. Genera una nueva práctica.")
    if request.index >= len(questions):
        raise HTTPException(404, "No existe esa pregunta en la sesión.")
    question = questions[request.index]
    actual = normalize(request.answer)
    expected = normalize(question["answer"])
    strip_accents = lambda text: "".join(
        char for char in unicodedata.normalize("NFD", text)
        if unicodedata.category(char) != "Mn"
    )
    correct = bool(actual) and strip_accents(actual) == strip_accents(expected)
    return {"correct": correct, "expected": question["answer"]}


@app.get("/")
def index():
    return FileResponse(ROOT / "index.html")


# Servir los recursos estáticos en el mismo origen que la API durante el desarrollo.
app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")
