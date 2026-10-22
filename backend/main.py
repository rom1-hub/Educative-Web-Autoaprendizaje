from __future__ import annotations

import random
import re
import uuid
import unicodedata
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
app = FastAPI(title="Coq — práctica de conjugación", version="0.2.0")

PERSONS = [
    ("je", 0),
    ("tu", 1),
    ("il", 2),
    ("elle", 2),
    ("on", 2),
    ("nous", 3),
    ("vous", 4),
    ("ils", 5),
    ("elles", 5),
]
IMPERATIVE_PERSONS = [("tu*", 0), ("nous*", 1), ("vous*", 2)]
SESSIONS: dict[str, list[dict[str, str]]] = {}

TENSE_LABELS = {
    "present": "Présent de l'indicatif",
    "imparfait": "Imparfait",
    "passe-compose": "Passé composé",
    "plus-que-parfait": "Plus-que-parfait",
    "passe-simple": "Passé simple",
    "passe-anterieur": "Passé antérieur",
    "futur-simple": "Futur simple",
    "futur-anterieur": "Futur antérieur",
    "subjonctif-present": "Subjonctif présent",
    "subjonctif-passe": "Subjonctif passé",
    "subjonctif-imparfait": "Subjonctif imparfait",
    "subjonctif-plus-que-parfait": "Subjonctif plus-que-parfait",
    "conditionnel-present": "Conditionnel présent",
    "conditionnel-passe": "Conditionnel passé",
    "imperatif-present": "Impératif présent",
    "imperatif-passe": "Impératif passé",
}
COMPOUND_TENSES = {
    "passe-compose",
    "plus-que-parfait",
    "passe-anterieur",
    "futur-anterieur",
    "subjonctif-passe",
    "subjonctif-plus-que-parfait",
    "conditionnel-passe",
    "imperatif-passe",
}

# Verbos regulares en -ER sin cambios ortográficos especiales.
REGULAR_FIRST_GROUP_VERBS = [
    "parler", "aimer", "adorer", "habiter", "jouer", "travailler",
    "regarder", "écouter", "demander", "donner", "chercher", "trouver",
    "porter", "penser", "marcher", "chanter", "danser", "visiter",
    "cuisiner", "dessiner", "étudier", "oublier", "utiliser", "quitter",
    "fermer", "préparer", "téléphoner", "terminer", "expliquer",
    "emprunter", "garder", "louer", "montrer", "détester", "raconter",
]


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFC", value or "").lower().replace("’", "'")
    return re.sub(r"\s+", " ", value.strip())


def regular_er_forms(verb: str, tense: str) -> list[dict[str, str]]:
    """Conjugate a regular first-group -ER verb in the selected tense."""
    lemma = normalize(verb)
    if not re.fullmatch(r"[a-zàâçéèêëîïôûùüÿœæ'-]+er", lemma):
        raise HTTPException(422, "Esta categoría solo admite infinitivos regulares en -ER.")
    if lemma == "aller" or re.search(r"(?:ger|cer|eler|eter|yer)$", lemma):
        raise HTTPException(422, "Este verbo pertenece a una familia con reglas particulares todavía no implementada.")
    if re.search(r"[eéèê][^aeiouyàâéèêëîïôûùüÿœæ]er$", lemma):
        raise HTTPException(422, "Este verbo pertenece a una familia con cambio ortográfico todavía no implementada.")
    if tense not in TENSE_LABELS:
        raise HTTPException(422, "Selecciona un tiempo verbal válido.")

    stem = lemma[:-2]
    infinitive = lemma
    participle = stem + "é"
    present = [stem + suffix for suffix in ("e", "es", "e", "e", "e", "ons", "ez", "ent", "ent")]
    imparfait = [stem + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    passe_simple = [stem + suffix for suffix in ("ai", "as", "a", "a", "a", "âmes", "âtes", "èrent", "èrent")]
    future = [infinitive + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    conditional = [infinitive + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    subj_present = [stem + suffix for suffix in ("e", "es", "e", "e", "e", "ions", "iez", "ent", "ent")]
    subj_imparfait = [stem + suffix for suffix in ("asse", "asses", "ât", "ât", "ât", "assions", "assiez", "assent", "assent")]

    avoir = {
        "present": ["ai", "as", "a", "a", "a", "avons", "avez", "ont", "ont"],
        "imparfait": ["avais", "avais", "avait", "avait", "avait", "avions", "aviez", "avaient", "avaient"],
        "passe-simple": ["eus", "eus", "eut", "eut", "eut", "eûmes", "eûtes", "eurent", "eurent"],
        "futur-simple": ["aurai", "auras", "aura", "aura", "aura", "aurons", "aurez", "auront", "auront"],
        "conditionnel-present": ["aurais", "aurais", "aurait", "aurait", "aurait", "aurions", "auriez", "auraient", "auraient"],
        "subjonctif-present": ["aie", "aies", "ait", "ait", "ait", "ayons", "ayez", "aient", "aient"],
        "subjonctif-imparfait": ["eusse", "eusses", "eût", "eût", "eût", "eussions", "eussiez", "eussent", "eussent"],
    }
    simple_forms = {
        "present": present,
        "imparfait": imparfait,
        "passe-simple": passe_simple,
        "futur-simple": future,
        "conditionnel-present": conditional,
        "subjonctif-present": subj_present,
        "subjonctif-imparfait": subj_imparfait,
    }
    compound_aux_tense = {
        "passe-compose": "present",
        "plus-que-parfait": "imparfait",
        "passe-anterieur": "passe-simple",
        "futur-anterieur": "futur-simple",
        "conditionnel-passe": "conditionnel-present",
        "subjonctif-passe": "subjonctif-present",
        "subjonctif-plus-que-parfait": "subjonctif-imparfait",
    }

    if tense == "imperatif-present":
        return [
            {"person": person, "form": form, "verb": lemma, "tense": tense}
            for (person, _), form in zip(IMPERATIVE_PERSONS, (stem + "e", stem + "ons", stem + "ez"))
        ]
    if tense == "imperatif-passe":
        return [
            {"person": person, "form": aux + " " + participle, "verb": lemma, "tense": tense}
            for (person, _), aux in zip(IMPERATIVE_PERSONS, ("aie", "ayons", "ayez"))
        ]

    if tense in simple_forms:
        forms = simple_forms[tense]
        rows = []
        for index, (person, _) in enumerate(PERSONS):
            display_person = person
            if tense.startswith("subjonctif-"):
                display_person = {
                    "je": "que je", "tu": "que tu", "il": "qu'il",
                    "elle": "qu'elle", "on": "qu'on", "nous": "que nous",
                    "vous": "que vous", "ils": "qu'ils", "elles": "qu'elles",
                }[person]
            rows.append({"person": display_person, "form": forms[index], "verb": lemma, "tense": tense})
        return rows

    aux_tense = compound_aux_tense.get(tense)
    if aux_tense:
        aux_forms = avoir[aux_tense]
        rows = []
        for index, (person, _) in enumerate(PERSONS):
            display_person = person
            if tense.startswith("subjonctif-"):
                display_person = {
                    "je": "que je", "tu": "que tu", "il": "qu'il",
                    "elle": "qu'elle", "on": "qu'on", "nous": "que nous",
                    "vous": "que vous", "ils": "qu'ils", "elles": "qu'elles",
                }[person]
            rows.append({
                "person": display_person,
                "form": aux_forms[index] + " " + participle,
                "verb": lemma,
                "tense": tense,
            })
        return rows

    raise HTTPException(422, "Este tiempo verbal todavía no está implementado.")


def regular_er_present(verb: str) -> list[dict[str, str]]:
    """Backward-compatible helper used by the existing present-tense tests."""
    return regular_er_forms(verb, "present")


class GenerateRequest(BaseModel):
    verb: str = Field(default="", max_length=80)
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
    if request.tense not in TENSE_LABELS:
        raise HTTPException(422, "Selecciona un tiempo verbal válido.")
    if request.family not in ("", "premier-groupe", "premier-groupe-reguliers"):
        raise HTTPException(422, "Esta primera versión solo incluye los verbos regulares del primer grupo.")
    if request.construction not in ("", "non-pronominal"):
        raise HTTPException(422, "Esta categoría solo incluye verbos no pronominales.")
    if request.tense in COMPOUND_TENSES and request.auxiliary == "etre":
        raise HTTPException(422, "« Parler » utiliza el auxiliar avoir en los tiempos compuestos. Selecciona Avoir o ambos auxiliares.")
    if request.auxiliary not in ("", "avoir", "etre"):
        raise HTTPException(422, "Selecciona un auxiliar válido.")

    category_mode = request.family == "premier-groupe-reguliers" and not request.verb.strip()
    if category_mode:
        selected_verbs = REGULAR_FIRST_GROUP_VERBS.copy()
        random.shuffle(selected_verbs)
        questions = []
        while len(questions) < 20:
            for verb in selected_verbs:
                forms = regular_er_forms(verb, request.tense)
                random.shuffle(forms)
                for form in forms:
                    questions.append({
                        "person": form["person"],
                        "verb": form["verb"],
                        "tense": form["tense"],
                        "answer": form["form"],
                    })
                    if len(questions) == 20:
                        break
                if len(questions) == 20:
                    break
            random.shuffle(selected_verbs)
    else:
        if not request.verb.strip():
            raise HTTPException(422, "Escribe un verbo o selecciona «Verbos regulares del primer grupo».")
        forms = regular_er_forms(request.verb, request.tense)
        # Repartir las formas por ciclos barajados independientes para evitar
        # que la misma secuencia corta se repita dentro de una sesión.
        questions = []
        while len(questions) < 20:
            cycle = forms.copy()
            random.shuffle(cycle)

            # Si es posible, evitar que el ciclo nuevo empiece con la misma
            # persona que terminó el ciclo anterior.
            if len(forms) > 1 and questions:
                previous_person = questions[-1]["person"]
                if cycle[0]["person"] == previous_person:
                    alternatives = [
                        i for i, item in enumerate(cycle)
                        if item["person"] != previous_person
                    ]
                    if alternatives:
                        swap_index = random.choice(alternatives)
                        cycle[0], cycle[swap_index] = cycle[swap_index], cycle[0]

            for form in cycle:
                questions.append({
                    "person": form["person"],
                    "verb": form["verb"],
                    "tense": form["tense"],
                    "answer": form["form"],
                })
                if len(questions) == 20:
                    break

    session_id = uuid.uuid4().hex
    SESSIONS[session_id] = questions
    return {
        "session_id": session_id,
        "total": len(questions),
        "questions": [
            {"index": i, **{key: value for key, value in item.items() if key != "answer"}}
            for i, item in enumerate(questions)
        ],
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
    correct = bool(actual) and actual == expected
    return {"correct": correct, "expected": question["answer"]}


@app.get("/")
def index():
    return FileResponse(ROOT / "index.html")


# Servir los recursos estáticos en el mismo origen que la API durante el desarrollo.
app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")
