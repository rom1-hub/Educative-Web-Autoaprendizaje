from __future__ import annotations

import functools
import json
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
# Evita repetir los infinitivos de las últimas prácticas de categoría en este proceso.
RECENT_CATEGORY_VERBS: list[str] = []
RECENT_CATEGORY_VERBS_LIMIT = 60

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

def is_supported_pronominal_variant(entry: dict, catalog: dict) -> bool:
    """Recognize a pronominal form whose base has a supported regular -ER entry."""
    if entry.get("pronominal") is not True or entry.get("construction") != "pronomiale":
        return False
    base = normalize(entry.get("infinitif_base") or "")
    base_entry = catalog.get(base)
    return (
        isinstance(base_entry, dict)
        and base_entry.get("pronominal") is False
        and base_entry.get("construction") in ("non-pronomiale", "non-pronominale")
        and base_entry.get("pattern") == entry.get("pattern")
    )


def is_supported_family_entry(entry: dict, catalog: dict) -> bool:
    return (
        entry.get("pronominal") is False
        and entry.get("construction") in ("non-pronomiale", "non-pronominale")
    ) or is_supported_pronominal_variant(entry, catalog)


def is_supported_first_group_entry(entry: dict, catalog: dict) -> bool:
    """Recognize regular first-group verbs, including pronominal records catalogued as group 3."""
    if entry.get("pronominal") is False:
        return (
            entry.get("groupe") == 1
            and entry.get("familyId") == "er-regular"
            and entry.get("construction") in ("non-pronomiale", "non-pronominale")
        )
    if entry.get("pronominal") is not True or entry.get("construction") != "pronomiale":
        return False
    base = normalize(entry.get("infinitif_base") or "")
    base_entry = catalog.get(base)
    return (
        isinstance(base_entry, dict)
        and base_entry.get("groupe") == 1
        and base_entry.get("familyId") == "er-regular"
        and base_entry.get("pronominal") is False
        and base_entry.get("construction") in ("non-pronomiale", "non-pronominale")
    )


@functools.lru_cache(maxsize=1)
def ger_family_verbs() -> tuple[str, ...]:
    """Return canonical non-pronominal verbs in the orthographic -GER families."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip()
        payload = payload.split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc
    candidates = []
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        if is_supported_family_entry(entry, catalog) and entry.get("pattern") in {"man:ger", "abr:éger"} and lemma.endswith("ger") and lemma:
            candidates.append(display_lemma)
    return tuple(sorted(set(candidates)))


@functools.lru_cache(maxsize=1)
def cer_family_verbs() -> tuple[str, ...]:
    """Return canonical non-pronominal verbs in the orthographic -CER families."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip()
        payload = payload.split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc
    candidates = []
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        if (
            is_supported_family_entry(entry, catalog)
            and entry.get("pattern") in {"pla:cer", "dép:ecer"}
            and lemma.endswith("cer")
            and lemma
        ):
            candidates.append(display_lemma)
    return tuple(sorted(set(candidates)))


@functools.lru_cache(maxsize=1)
def impersonal_verb_catalog() -> dict[str, dict]:
    """Load complementary metadata for impersonal and defective verbs."""
    path = ROOT / "data" / "verbs" / "impersonal-database.js"
    try:
        source = path.read_text(encoding="utf-8")
        marker = "window.COQ_IMPERSONAL_VERBS || {},"
        marker_index = source.find(marker)
        if marker_index < 0:
            raise ValueError("No se encontró el catálogo complementario de verbos impersonales.")
        payload = source[marker_index + len(marker):].lstrip()
        # El archivo es JavaScript, no JSON puro: algunas claves de nivel superior
        # no están entre comillas. Normalizarlas antes de decodificar el objeto.
        payload = re.sub(
            r'(?m)([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:',
            r'\1"\2":',
            payload,
        )
        catalog, _ = json.JSONDecoder().raw_decode(payload)
        if not isinstance(catalog, dict):
            raise ValueError("El catálogo complementario no contiene un objeto.")
        return {
            normalize(entry.get("infinitif") or key): entry
            for key, entry in catalog.items()
            if isinstance(entry, dict)
        }
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            500, "No se pudo cargar el catálogo complementario de verbos impersonales."
        ) from exc


def impersonal_er_forms(verb: str, tense: str) -> list[dict[str, str]]:
    """Build a single valid practice prompt for a supported impersonal -ER verb."""
    display_lemma = normalize(verb)
    record = impersonal_verb_catalog().get(display_lemma)
    if not record or record.get("impersonal") is not True:
        raise HTTPException(422, "El verbo no está registrado como impersonal.")
    if tense in ("imperatif-present", "imperatif-passe"):
        raise HTTPException(422, "Los verbos impersonales no admiten imperativo.")

    simple_keys = {
        "present": "présent de l'indicatif",
        "imparfait": "imparfait",
        "passe-simple": "passé simple",
        "futur-simple": "futur simple",
        "conditionnel-present": "conditionnel présent",
        "subjonctif-present": "subjonctif présent",
        "subjonctif-imparfait": "subjonctif imparfait",
    }
    if tense in simple_keys:
        values = record.get("formes", {}).get(simple_keys[tense])
        if not isinstance(values, list) or len(values) < 3 or not values[2]:
            raise HTTPException(422, "No hay una forma canónica disponible para este verbo y tiempo verbal.")
        person = "qu'il" if tense.startswith("subjonctif-") else "il"
        form = str(values[2])
    elif tense in COMPOUND_TENSES:
        # Reutilizar el auxiliar generado por el motor y el participio canónico.
        auxiliary_rows = regular_er_forms("parler", tense)
        auxiliary_row = next(
            (row for row in auxiliary_rows if row["person"] in ("il", "qu'il")),
            None,
        )
        participle = str(record.get("participePasse") or "").strip()
        if not auxiliary_row or not participle or " " not in auxiliary_row["form"]:
            raise HTTPException(422, "No hay una forma compuesta canónica disponible para este verbo y tiempo verbal.")
        form = auxiliary_row["form"].rsplit(" ", 1)[0] + " " + participle
        person = auxiliary_row["person"]
    else:
        raise HTTPException(422, "Este tiempo verbal no está implementado para el verbo impersonal.")

    return [{"person": person, "form": form, "verb": display_lemma, "tense": tense}]


@functools.lru_cache(maxsize=1)
def regular_first_group_verbs() -> tuple[str, ...]:
    """
    Read the canonical frontend catalog and keep only explicitly tagged,
    non-pronominal regular first-group verbs supported by this conjugator.
    The catalog is cached for the lifetime of the backend process.
    """
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip()
        # El archivo define el catálogo y después declara la versión en otra
        # instrucción JavaScript; solo el primer objeto es JSON.
        payload = payload.split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            500,
            "No se pudo cargar el catálogo canónico de verbos para generar la práctica."
        ) from exc

    candidates = []
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        if not lemma or not is_supported_first_group_entry(entry, catalog):
            continue
        try:
            regular_er_forms(display_lemma, "present")
        except HTTPException:
            continue
        candidates.append(display_lemma)

    # Neiger est un verbe impersonnel du premier groupe, fourni par le catalogue complémentaire.
    neiger = impersonal_verb_catalog().get("neiger")
    if neiger and neiger.get("impersonal") is True and str(neiger.get("groupe")) == "1":
        candidates.append("neiger")
    return tuple(sorted(set(candidates)))


@functools.lru_cache(maxsize=1)
def pronominal_first_group_verbs() -> tuple[str, ...]:
    """Return supported canonical pronominal verbs in the regular first group."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip().split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc

    candidates = []
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        display_lemma = normalize(entry.get("infinitif") or entry.get("id") or "")
        if entry.get("pronominal") is True and display_lemma and is_supported_pronominal_variant(entry, catalog):
            try:
                regular_er_forms(display_lemma, "present")
            except HTTPException:
                continue
            candidates.append(display_lemma)
    return tuple(sorted(set(candidates)))


@functools.lru_cache(maxsize=1)
def eler_family_patterns() -> dict[str, str]:
    """Return canonical non-pronominal -ELER verbs with a supported spelling pattern."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip().split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc

    patterns = {}
    supported = {"app:eler", "p:eler", "harc:eler", "rév:éler"}
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        pattern = entry.get("pattern")
        if (
            is_supported_family_entry(entry, catalog)
            and lemma.endswith(("eler", "éler"))
            and (pattern in supported or lemma == "dénickeler")
        ):
            patterns[display_lemma] = "app:eler" if lemma in ("harceler", "dénickeler") else pattern
    return patterns


def eler_family_verbs() -> tuple[str, ...]:
    return tuple(sorted(eler_family_patterns()))


@functools.lru_cache(maxsize=1)
def eter_family_patterns() -> dict[str, str]:
    """Return canonical non-pronominal -ETER verbs with supported spelling patterns."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip().split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc

    patterns = {}
    supported = {"ach:eter", "j:eter", "décr:éter", "héb:éter"}
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        pattern = entry.get("pattern")
        if (
            is_supported_family_entry(entry, catalog)
            and lemma.endswith(("eter", "éter"))
            and lemma != "duveter"
            and pattern in supported
        ):
            patterns[display_lemma] = pattern
    return patterns


def eter_family_verbs() -> tuple[str, ...]:
    return tuple(sorted(eter_family_patterns()))


@functools.lru_cache(maxsize=1)
def e_accent_family_patterns() -> dict[str, str]:
    """Return canonical non-pronominal E/È + consonant + ER verbs, excluding specific suffix families."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip().split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc

    # Lista blanca de patrones del catálogo. La terminación específica tiene
    # prioridad: -GER, -CER, -ELER y -ETER no entran en esta familia.
    supported = {
        "c:éder", "réf:érer", "cr:émer", "ali:éner", "l:éser",
        "l:ever", "m:ener", "prom:ener", "p:eser", "s:emer", "rec:eper", "rec:éper",
    }
    patterns = {}
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        pattern = entry.get("pattern")
        if (
            is_supported_family_entry(entry, catalog)
            and lemma.endswith("er")
            and not lemma.endswith(("ger", "cer", "eler", "éler", "eter", "éter"))
            and (pattern in supported or lemma == "promener")
        ):
            patterns[display_lemma] = "prom:ener" if lemma == "promener" else pattern
    return patterns


@functools.lru_cache(maxsize=1)
def yer_family_patterns() -> dict[str, str]:
    """Return canonical non-pronominal -YER verbs with explicitly supported patterns."""
    catalog_path = ROOT / "data" / "verbs" / "local-database.js"
    try:
        source = catalog_path.read_text(encoding="utf-8")
        prefix = "window.COQ_VERBS="
        prefix_index = source.find(prefix)
        if prefix_index < 0:
            raise ValueError("No se reconoce el formato del catálogo de verbos.")
        payload = source[prefix_index + len(prefix):].strip()
        payload = payload.split(";\nwindow.", 1)[0].strip()
        if payload.endswith(";"):
            payload = payload[:-1]
        catalog = json.loads(payload)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica.") from exc

    supported = {"netto:yer", "pa:yer", "env:oyer", "grasse:yer"}
    patterns = {}
    for entry in catalog.values():
        if not isinstance(entry, dict):
            continue
        lemma = normalize(entry.get("infinitif_base") or entry.get("infinitif") or entry.get("id") or "")
        display_lemma = normalize(entry.get("infinitif") or lemma)
        pattern = entry.get("pattern")
        if is_supported_family_entry(entry, catalog) and lemma.endswith("yer") and pattern in supported:
            patterns[display_lemma] = pattern
    return patterns


def yer_family_verbs() -> tuple[str, ...]:
    return tuple(sorted(yer_family_patterns()))


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFC", value or "").lower().replace("’", "'")
    return re.sub(r"\s+", " ", value.strip())


ETRE_PRIORITY_PARTICIPLES = {
    "entrer": "entré",
    "monter": "monté",
    "descendre": "descendu",
    "passer": "passé",
    "sortir": "sorti",
    "retourner": "retourné",
    "arriver": "arrivé",
}

# Contextos de sujeto exclusivos de «Practicar».
# Cada variante conserva el pronombre base y añade el género/número necesario
# para mostrar el contexto y validar la concordancia del participio.
PRACTICE_SUBJECT_VARIANTS = {
    "je": [
        ("masculin", "singulier", "masculin singulier"),
        ("féminin", "singulier", "féminin singulier"),
    ],
    "tu": [
        ("masculin", "singulier", "masculin singulier"),
        ("féminin", "singulier", "féminin singulier"),
    ],
    "il": [("masculin", "singulier", None)],
    "elle": [("féminin", "singulier", None)],
    "on": [
        ("masculin", "singulier", "impersonnel, masculin singulier"),
        ("masculin", "pluriel", "masculin pluriel"),
        ("féminin", "pluriel", "féminin pluriel"),
    ],
    "nous": [
        ("masculin", "pluriel", "masculin pluriel"),
        ("féminin", "pluriel", "féminin pluriel"),
    ],
    "vous": [
        ("masculin", "singulier", "masculin singulier"),
        ("féminin", "singulier", "féminin singulier"),
        ("masculin", "pluriel", "masculin pluriel"),
        ("féminin", "pluriel", "féminin pluriel"),
    ],
    "ils": [("masculin", "pluriel", None)],
    "elles": [("féminin", "pluriel", None)],
}
PRONOMINAL_NO_SUBJECT_AGREEMENT = {"se parler", "se téléphoner", "se demander", "s'agir", "se pouvoir"}


def canonical_practice_person(person: str) -> str:
    """Return the base pronoun without subjunctive framing."""
    if person.startswith("que "):
        return person[4:]
    if person.startswith("qu'"):
        return person[3:]
    return person


def expand_practice_etre_subject_variants(
    forms: list[dict[str, str]], verb: str, tense: str
) -> list[dict[str, str]]:
    """Expand only practice prompts whose être participle agrees with the subject."""
    display_verb = normalize(verb)
    if tense not in COMPOUND_TENSES or tense == "imperatif-passe":
        return forms

    is_pronominal = display_verb.startswith(("se ", "s'"))
    if not is_pronominal and display_verb not in ETRE_PRIORITY_PARTICIPLES:
        return forms
    if is_pronominal and display_verb in PRONOMINAL_NO_SUBJECT_AGREEMENT:
        return forms

    expanded = []
    for form in forms:
        original_person = form["person"]
        person_key = canonical_practice_person(original_person)
        variants = PRACTICE_SUBJECT_VARIANTS.get(person_key)
        if not variants:
            expanded.append({**form, "person_key": person_key})
            continue

        answer = form["form"]
        prefix, separator, participle = answer.rpartition(" ")
        if not separator:
            expanded.append({**form, "person_key": person_key})
            continue

        # Remove the agreement already applied to the canonical nine-person form,
        # then apply the ending for the selected context.
        if person_key == "elle" and participle.endswith("e"):
            participle = participle[:-1]
        elif person_key == "elles" and participle.endswith("es"):
            participle = participle[:-2]
        elif person_key in ("nous", "vous", "ils") and participle.endswith("s"):
            participle = participle[:-1]

        display_prefix = original_person if original_person.startswith(("que ", "qu'")) else person_key
        for gender, number, description in variants:
            label = f"{display_prefix} ({description})" if description else original_person
            if gender == "féminin" and number == "singulier":
                ending = "e"
            elif gender == "féminin" and number == "pluriel":
                ending = "es"
            elif gender == "masculin" and number == "pluriel":
                ending = "s"
            else:
                ending = ""

            expanded.append({
                **form,
                "person": label,
                "person_key": person_key,
                "subject_gender": gender,
                "subject_number": number,
                "subject_variant": label,
                "form": prefix + separator + participle + ending,
            })
    return expanded



def etre_priority_compound_forms(verb: str, tense: str) -> list[dict[str, str]]:
    """Conjugate the selected auxiliary-priority verbs with être in compound tenses."""
    participle = ETRE_PRIORITY_PARTICIPLES[verb]
    etre = {
        "present": ["suis", "es", "est", "est", "est", "sommes", "êtes", "sont", "sont"],
        "imparfait": ["étais", "étais", "était", "était", "était", "étions", "étiez", "étaient", "étaient"],
        "passe-simple": ["fus", "fus", "fut", "fut", "fut", "fûmes", "fûtes", "furent", "furent"],
        "futur-simple": ["serai", "seras", "sera", "sera", "sera", "serons", "serez", "seront", "seront"],
        "conditionnel-present": ["serais", "serais", "serait", "serait", "serait", "serions", "seriez", "seraient", "seraient"],
        "subjonctif-present": ["sois", "sois", "soit", "soit", "soit", "soyons", "soyez", "soient", "soient"],
        "subjonctif-imparfait": ["fusse", "fusses", "fût", "fût", "fût", "fussions", "fussiez", "fussent", "fussent"],
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

    def agreed_participle(person: str) -> str:
        if person in ("elle",):
            return participle + "e"
        if person in ("elles",):
            return participle + "es"
        if person in ("nous", "vous", "ils", "nous*", "vous*"):
            return participle + "s"
        return participle

    subjunctive_labels = {
        "je": "que je", "tu": "que tu", "il": "qu'il",
        "elle": "qu'elle", "on": "qu'on", "nous": "que nous",
        "vous": "que vous", "ils": "qu'ils", "elles": "qu'elles",
    }
    if tense == "imperatif-passe":
        imperative_aux = ("sois", "soyons", "soyez")
        return [
            {
                "person": person,
                "form": aux + " " + agreed_participle(person),
                "verb": verb,
                "tense": tense,
            }
            for (person, _), aux in zip(IMPERATIVE_PERSONS, imperative_aux)
        ]

    aux_tense = compound_aux_tense.get(tense)
    if aux_tense is None:
        raise HTTPException(422, "Este verbo solo está habilitado en esta corrección para los tiempos compuestos.")
    return [
        {
            "person": subjunctive_labels.get(person, person) if tense.startswith("subjonctif-") else person,
            "form": etre[aux_tense][index] + " " + agreed_participle(person),
            "verb": verb,
            "tense": tense,
        }
        for index, (person, _) in enumerate(PERSONS)
    ]


def regular_er_forms(verb: str, tense: str, family: str = "") -> list[dict[str, str]]:
    """Conjugate a regular first-group -ER verb in the selected tense."""
    display_lemma = normalize(verb)
    if display_lemma in ETRE_PRIORITY_PARTICIPLES and tense in COMPOUND_TENSES:
        allowed_first_group_families = ("", "premier-groupe", "premier-groupe-reguliers")
        if family not in allowed_first_group_families:
            raise HTTPException(422, "Este verbo no pertenece a la familia seleccionada.")
        if display_lemma in ("descendre", "sortir") and family:
            raise HTTPException(422, "Este verbo no pertenece a las familias regulares del primer grupo.")
        return etre_priority_compound_forms(display_lemma, tense)
    if display_lemma in ("descendre", "sortir"):
        raise HTTPException(422, "Esta corrección habilita estos verbos únicamente en los tiempos compuestos.")

    is_pronominal = display_lemma.startswith("se ") or display_lemma.startswith("s'")
    if display_lemma.startswith("se "):
        lemma = display_lemma[3:].strip()
    elif display_lemma.startswith("s'"):
        lemma = display_lemma[2:].strip()
    else:
        lemma = display_lemma
    if not re.fullmatch(r"[a-zàâçéèêëîïôûùüÿœæ'-]+er", lemma):
        raise HTTPException(422, "Esta categoría solo admite infinitivos regulares en -ER.")
    is_ger_family = lemma.endswith("ger")
    is_cer_family = lemma.endswith("cer")
    is_eler_family = lemma.endswith(("eler", "éler"))
    is_eter_family = lemma.endswith(("eter", "éter"))
    is_yer_family = lemma.endswith("yer")
    yer_pattern = yer_family_patterns().get(display_lemma) if is_yer_family else None
    eler_pattern = eler_family_patterns().get(display_lemma) if is_eler_family else None
    eter_pattern = eter_family_patterns().get(display_lemma) if is_eter_family else None
    # La terminación específica prevalece sobre una alternancia E/È genérica.
    suffix_family = (
        "ger" if is_ger_family else
        "cer" if is_cer_family else
        "eler" if is_eler_family else
        "eter" if is_eter_family else
        "yer" if is_yer_family else
        ""
    )
    e_accent_pattern = e_accent_family_patterns().get(display_lemma) if not suffix_family else None
    is_e_accent_family = e_accent_pattern is not None
    if lemma == "aller" or (re.search(r"(?:eter|yer)$", lemma) and not (is_eter_family or is_yer_family)):
        raise HTTPException(422, "Este verbo pertenece a una familia con reglas particulares todavía no implementada.")
    if is_ger_family and display_lemma not in ger_family_verbs():
        raise HTTPException(422, "Este verbo no pertenece a la familia ortográfica -GER compatible (manger, changer, nager…).")
    if is_eler_family and eler_pattern is None:
        raise HTTPException(422, "Este verbo no pertenece a la familia -ELER compatible.")
    if is_eter_family and eter_pattern is None:
        raise HTTPException(422, "Este verbo no pertenece a la familia -ETER compatible.")
    if family == "e-accent" and (suffix_family or e_accent_pattern is None):
        raise HTTPException(422, "El verbo escrito no pertenece a la familia E (È) + CONSONANTE + ER compatible.")
    if family == "ger" and not is_ger_family:
        raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -GER compatible.")
    if family == "cer" and not is_cer_family:
        raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -CER compatible.")
    if family == "eler" and not is_eler_family:
        raise HTTPException(422, "El verbo escrito no pertenece a la familia -ELER compatible.")
    if family == "eter" and not is_eter_family:
        raise HTTPException(422, "El verbo escrito no pertenece a la familia -ETER compatible.")
    if family == "yer" and not is_yer_family:
        raise HTTPException(422, "El verbo escrito no pertenece a la familia -YER compatible.")
    if is_yer_family and yer_pattern is None:
        raise HTTPException(422, "Este verbo no pertenece a la familia -YER compatible.")
    if is_cer_family and display_lemma not in cer_family_verbs():
        raise HTTPException(422, "Este verbo no pertenece a la familia ortográfica -CER compatible (commencer, annoncer, avancer…).")
    if not suffix_family and not is_e_accent_family and re.search(r"[eéè][^aeiouyàâéèêëîïôûùüÿœæ]er$", lemma):
        raise HTTPException(422, "Este verbo pertenece a una familia con cambio ortográfico todavía no implementada.")
    if tense not in TENSE_LABELS:
        raise HTTPException(422, "Selecciona un tiempo verbal válido.")

    stem = lemma[:-2]
    infinitive = lemma
    participle = stem + "é"
    if yer_pattern in ("netto:yer", "pa:yer", "env:oyer"):
        strong_stem = stem[:-1] + "i"
    elif eter_pattern == "ach:eter":
        strong_stem = stem[:-2] + "è" + stem[-1]
    elif eter_pattern == "j:eter":
        strong_stem = stem + stem[-1]
    elif eler_pattern == "app:eler":
        strong_stem = stem + "l"
    elif eler_pattern == "p:eler":
        strong_stem = stem[:-2] + "è" + stem[-1]
    elif is_e_accent_family or (is_ger_family and re.search(r"[éèê]", stem)) or eler_pattern == "rév:éler" or eter_pattern in ("décr:éter", "héb:éter"):
        # Alternancia E/È en las formas con e muda: lever -> lève, protéger -> protège.
        strong_stem = re.sub(r"[eé](?=[^aeiouyàâéèêëîïôûùüÿœæ]$)", "è", stem)
    else:
        strong_stem = stem
    present = [stem + suffix for suffix in ("e", "es", "e", "e", "e", "ons", "ez", "ent", "ent")]
    if is_ger_family or is_eler_family or is_eter_family or is_yer_family or is_e_accent_family:
        present = [(strong_stem if (is_eler_family or is_eter_family or is_e_accent_family or (is_ger_family and strong_stem != stem) or yer_pattern in ("netto:yer", "pa:yer", "env:oyer")) and i not in (5, 6) else stem) + ending for i, ending in enumerate(("e", "es", "e", "e", "e", "ons", "ez", "ent", "ent"))]
    if is_ger_family:
        present[5] = stem + "eons"
    if is_cer_family:
        present[5] = stem[:-1] + "çons"
    imparfait = [stem + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    if is_ger_family:
        # En -GER, la « e » se conserva salvo con nous y vous: mangeais, mais mangions.
        imparfait = [stem + ("e" if index not in (5, 6) else "") + suffix for index, suffix in enumerate(("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient"))]
    if is_cer_family:
        # En -CER, se usa « ç » delante de a, pero no delante de i: commençais, commencions.
        imparfait = [(stem[:-1] + "ç" if index not in (5, 6) else stem) + suffix for index, suffix in enumerate(("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient"))]
    passe_simple = [stem + suffix for suffix in ("ai", "as", "a", "a", "a", "âmes", "âtes", "èrent", "èrent")]
    if is_ger_family:
        passe_simple = [stem + ("e" if index < 7 else "") + suffix for index, suffix in enumerate(("ai", "as", "a", "a", "a", "âmes", "âtes", "èrent", "èrent"))]
    if is_cer_family:
        passe_simple = [(stem[:-1] + "ç" if index < 7 else stem) + suffix for index, suffix in enumerate(("ai", "as", "a", "a", "a", "âmes", "âtes", "èrent", "èrent"))]
    future = [infinitive + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    if eler_pattern in ("app:eler", "p:eler", "harc:eler") or eter_pattern in ("ach:eter", "j:eter"):
        future = [strong_stem + "er" + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    elif is_e_accent_family and e_accent_pattern in ("l:ever", "m:ener", "prom:ener", "p:eser", "s:emer", "rec:eper", "rec:éper"):
        future = [strong_stem + "er" + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    elif yer_pattern in ("netto:yer", "pa:yer"):
        future = [strong_stem + "er" + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    elif yer_pattern == "env:oyer":
        future_stem = lemma[:-4] + "err"
        future = [future_stem + suffix for suffix in ("ai", "as", "a", "a", "a", "ons", "ez", "ont", "ont")]
    conditional = [infinitive + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    if eler_pattern in ("app:eler", "p:eler", "harc:eler") or eter_pattern in ("ach:eter", "j:eter"):
        conditional = [strong_stem + "er" + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    elif is_e_accent_family and e_accent_pattern in ("l:ever", "m:ener", "prom:ener", "p:eser", "s:emer", "rec:eper", "rec:éper"):
        conditional = [strong_stem + "er" + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    elif yer_pattern in ("netto:yer", "pa:yer"):
        conditional = [strong_stem + "er" + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    elif yer_pattern == "env:oyer":
        future_stem = lemma[:-4] + "err"
        conditional = [future_stem + suffix for suffix in ("ais", "ais", "ait", "ait", "ait", "ions", "iez", "aient", "aient")]
    subj_present = [stem + suffix for suffix in ("e", "es", "e", "e", "e", "ions", "iez", "ent", "ent")]
    if is_ger_family or is_eler_family or is_eter_family or is_yer_family or is_e_accent_family:
        subj_present = [(strong_stem if (is_eler_family or is_eter_family or is_e_accent_family or (is_ger_family and strong_stem != stem) or yer_pattern in ("netto:yer", "pa:yer", "env:oyer")) and i not in (5, 6) else stem) + ending for i, ending in enumerate(("e", "es", "e", "e", "e", "ions", "iez", "ent", "ent"))]
    subj_imparfait = [stem + suffix for suffix in ("asse", "asses", "ât", "ât", "ât", "assions", "assiez", "assent", "assent")]
    if is_cer_family:
        subj_imparfait = [stem[:-1] + "ç" + suffix for suffix in ("asse", "asses", "ât", "ât", "ât", "assions", "assiez", "assent", "assent")]

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

    def reflexive_prefix(form: str, index: int) -> str:
        if not is_pronominal:
            return form
        pronouns = ("me", "te", "se", "se", "se", "nous", "vous", "se", "se")
        pronoun = pronouns[index]
        if pronoun in ("me", "te", "se") and form[:1] in "aeiouyàâéèêëîïôùûüœæh":
            pronoun = {"me": "m'", "te": "t'", "se": "s'"}[pronoun]
            return pronoun + form
        return pronoun + " " + form

    if is_pronominal:
        for key, values in simple_forms.items():
            simple_forms[key] = [reflexive_prefix(form, index) for index, form in enumerate(values)]

    no_participle_agreement = {"se parler", "se téléphoner", "se demander"}

    def participle_for_person(person: str) -> str:
        if not is_pronominal or display_lemma in no_participle_agreement:
            return participle
        if person in ("elle",):
            return participle + "e"
        if person in ("elles",):
            return participle + "es"
        if person in ("nous", "vous", "ils", "nous*", "vous*"):
            return participle + "s"
        return participle
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
        imperative_forms = [
            (strong_stem if (is_eler_family or is_eter_family or is_e_accent_family or (is_ger_family and strong_stem != stem) or (is_yer_family and yer_pattern in ("netto:yer", "pa:yer", "env:oyer"))) else stem) + "e",
            stem + "eons" if is_ger_family else stem[:-1] + "çons" if is_cer_family else stem + "ons",
            stem + "ez",
        ]
        if is_pronominal:
            imperative_forms = [imperative_forms[0] + "-toi", imperative_forms[1] + "-nous", imperative_forms[2] + "-vous"]
        return [
            {"person": person, "form": form, "verb": display_lemma, "tense": tense}
            for (person, _), form in zip(IMPERATIVE_PERSONS, imperative_forms)
        ]
    if tense == "imperatif-passe":
        imperative_aux = ("sois-toi", "soyons-nous", "soyez-vous") if is_pronominal else ("aie", "ayons", "ayez")
        return [
            {"person": person, "form": aux + " " + participle_for_person(person), "verb": display_lemma, "tense": tense}
            for (person, _), aux in zip(IMPERATIVE_PERSONS, imperative_aux)
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
            rows.append({"person": display_person, "form": forms[index], "verb": display_lemma, "tense": tense})
        return rows

    aux_tense = compound_aux_tense.get(tense)
    if aux_tense:
        etre = {
            "present": ["suis", "es", "est", "est", "est", "sommes", "êtes", "sont", "sont"],
            "imparfait": ["étais", "étais", "était", "était", "était", "étions", "étiez", "étaient", "étaient"],
            "passe-simple": ["fus", "fus", "fut", "fut", "fut", "fûmes", "fûtes", "furent", "furent"],
            "futur-simple": ["serai", "seras", "sera", "sera", "sera", "serons", "serez", "seront", "seront"],
            "conditionnel-present": ["serais", "serais", "serait", "serait", "serait", "serions", "seriez", "seraient", "seraient"],
            "subjonctif-present": ["sois", "sois", "soit", "soit", "soit", "soyons", "soyez", "soient", "soient"],
            "subjonctif-imparfait": ["fusse", "fusses", "fût", "fût", "fût", "fussions", "fussiez", "fussent", "fussent"],
        }
        aux_forms = etre[aux_tense] if is_pronominal else avoir[aux_tense]
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
                "form": reflexive_prefix(aux_forms[index], index) + " " + participle_for_person(person) if is_pronominal else aux_forms[index] + " " + participle,
                "verb": display_lemma,
                "tense": tense,
            })
        return rows

    raise HTTPException(422, "Este tiempo verbal todavía no está implementado.")



def _load_js_object(relative_path: str, variable: str) -> dict:
    """Load the first JSON object assigned to a window variable in a JS catalog."""
    path = ROOT / relative_path
    try:
        source = path.read_text(encoding="utf-8")
        match = re.search(r"window\." + re.escape(variable) + r"\s*=\s*", source)
        if not match:
            raise ValueError(f"No se encontró la variable {variable}.")
        payload, _ = json.JSONDecoder().raw_decode(source, match.end())
        if not isinstance(payload, dict):
            raise ValueError(f"La variable {variable} no contiene un objeto.")
        return payload
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            500, "No se pudo cargar el catálogo canónico de verbos para generar la práctica."
        ) from exc


@functools.lru_cache(maxsize=1)
def second_group_catalog() -> dict[str, dict]:
    """Return valid canonical second-group records indexed by normalized infinitive."""
    catalog = _load_js_object("data/verbs/local-database.js", "COQ_VERBS")
    result = {}
    required_forms = {
        "présent de l'indicatif", "imparfait", "passé simple", "futur simple",
        "conditionnel présent", "subjonctif présent", "subjonctif imparfait",
        "impératif présent",
    }
    for key, entry in catalog.items():
        if not isinstance(entry, dict):
            continue
        group = entry.get("groupe", entry.get("group"))
        if str(group) != "2" or entry.get("pronominal") is True:
            continue
        if entry.get("construction") not in ("non-pronomiale", "non-pronominale"):
            continue
        forms = entry.get("formes")
        if not isinstance(forms, dict) or not required_forms.issubset(forms):
            continue
        if any(not isinstance(forms[name], list) or len(forms[name]) != (3 if name == "impératif présent" else 6)
               for name in required_forms):
            continue
        lemma = normalize(entry.get("infinitif") or key)
        result[lemma] = entry
    return result


@functools.lru_cache(maxsize=1)
def second_group_pronominal_catalog() -> dict[str, dict]:
    """Return active pronominal records whose non-pronominal base belongs to group two."""
    records = _load_js_object("data/verbs/pronominal-database.js", "COQ_PRONOMINAL_VERBS")
    bases = second_group_catalog()
    result = {}
    for record in records.values():
        if not isinstance(record, dict) or record.get("actif") is False:
            continue
        lemma = normalize(record.get("infinitif") or "")
        base = normalize(record.get("formeNonPronominale") or record.get("infinitifBase") or "")
        if lemma and base in bases:
            result[lemma] = record
    return result


@functools.lru_cache(maxsize=1)
def second_group_verbs() -> tuple[str, ...]:
    """Return canonical non-pronominal second-group infinitives supported by the catalog."""
    return tuple(sorted(second_group_catalog()))


@functools.lru_cache(maxsize=1)
def second_group_pronominal_verbs() -> tuple[str, ...]:
    """Return supported pronominal variants of second-group verbs."""
    return tuple(sorted(second_group_pronominal_catalog()))


def is_second_group_verb(verb: str) -> bool:
    """Recognize a second-group base or a registered pronominal variant."""
    lemma = normalize(verb)
    if lemma in second_group_catalog() or lemma in second_group_pronominal_catalog():
        return True
    if lemma.startswith("se ") or lemma.startswith("s'"):
        return lemma in second_group_pronominal_catalog()
    return False


def second_group_forms(verb: str, tense: str) -> list[dict[str, str]]:
    """Build all 16 tense forms from canonical second-group forms and metadata."""
    display_lemma = normalize(verb)
    is_pronominal = display_lemma.startswith(("se ", "s'"))
    pronominal_record = second_group_pronominal_catalog().get(display_lemma) if is_pronominal else None
    if is_pronominal and pronominal_record is None:
        raise HTTPException(422, "La variante pronominal no está registrada para el segundo grupo.")
    base = normalize(
        (pronominal_record or {}).get("formeNonPronominale")
        or (pronominal_record or {}).get("infinitifBase")
        or display_lemma.removeprefix("se ").removeprefix("s'")
    )
    entry = second_group_catalog().get(base)
    if entry is None:
        raise HTTPException(422, "El verbo escrito no pertenece al segundo grupo compatible.")
    if tense not in TENSE_LABELS:
        raise HTTPException(422, "Selecciona un tiempo verbal válido.")

    impersonal = bool((pronominal_record or {}).get("impersonal"))
    if impersonal and tense in ("imperatif-present", "imperatif-passe"):
        raise HTTPException(422, "Este verbo impersonal no admite imperativo.")

    person_rows = PERSONS
    person_indexes = [0, 1, 2, 2, 2, 3, 4, 5, 5]
    subjunctive_labels = {
        "je": "que je", "tu": "que tu", "il": "qu'il",
        "elle": "qu'elle", "on": "qu'on", "nous": "que nous",
        "vous": "que vous", "ils": "qu'ils", "elles": "qu'elles",
    }
    no_agreement = is_pronominal and (pronominal_record or {}).get("accordParticipePasse") != "sujet"
    participle = str(
        (pronominal_record or {}).get("participePasse")
        or entry.get("participePasse") or ""
    ).strip()
    if not participle:
        raise HTTPException(422, "Falta el participio pasado canónico del verbo.")

    def reflexive_prefix(form: str, index: int) -> str:
        if not is_pronominal:
            return form
        pronoun = ("me", "te", "se", "se", "se", "nous", "vous", "se", "se")[index]
        if pronoun in ("me", "te", "se") and form[:1] in "aeiouyàâéèêëîïôùûüœæh":
            return {"me": "m'", "te": "t'", "se": "s'"}[pronoun] + form
        return pronoun + " " + form

    def agreed_participle(person: str) -> str:
        if not is_pronominal or no_agreement:
            return participle
        if person in ("elle",):
            return participle + "e"
        if person in ("elles",):
            return participle + "es"
        if person in ("nous", "vous", "ils", "nous*", "vous*"):
            return participle + "s"
        return participle

    def canonical_form(value) -> str:
        # Algunas entradas canónicas guardan cada forma como [sujeto, conjugación].
        # La práctica pide escribir únicamente la forma conjugada, sin repetir el sujeto.
        if isinstance(value, (list, tuple)):
            if not value:
                raise HTTPException(500, "Hay una forma verbal canónica vacía.")
            value = value[-1]
        return str(value)

    if tense in (
        "present", "imparfait", "passe-simple", "futur-simple",
        "conditionnel-present", "subjonctif-present", "subjonctif-imparfait",
    ):
        form_key = {
            "present": "présent de l'indicatif",
            "imparfait": "imparfait",
            "passe-simple": "passé simple",
            "futur-simple": "futur simple",
            "conditionnel-present": "conditionnel présent",
            "subjonctif-present": "subjonctif présent",
            "subjonctif-imparfait": "subjonctif imparfait",
        }[tense]
        stored = entry["formes"][form_key]
        rows = []
        indices = [2] if impersonal else range(len(person_rows))
        for index in indices:
            person, _ = person_rows[index]
            form = reflexive_prefix(canonical_form(stored[person_indexes[index]]), index)
            rows.append({
                "person": subjunctive_labels[person] if tense.startswith("subjonctif-") else person,
                "form": form, "verb": display_lemma, "tense": tense,
            })
        return rows

    if tense == "imperatif-present":
        stored = entry["formes"]["impératif présent"]
        rows = []
        for (person, _), raw_form in zip(IMPERATIVE_PERSONS, stored):
            form = canonical_form(raw_form)
            if is_pronominal:
                suffix = {"tu*": "-toi", "nous*": "-nous", "vous*": "-vous"}[person]
                form += suffix
            rows.append({"person": person, "form": form, "verb": display_lemma, "tense": tense})
        return rows

    if tense in COMPOUND_TENSES:
        # COQ exercise contract: non-pronominal second-group verbs use avoir;
        # registered pronominal variants use être and their configured agreement.
        auxiliary = "être" if is_pronominal else "avoir"
        aux_tense = {
            "passe-compose": "present",
            "plus-que-parfait": "imparfait",
            "passe-anterieur": "passe-simple",
            "futur-anterieur": "futur-simple",
            "conditionnel-passe": "conditionnel-present",
            "subjonctif-passe": "subjonctif-present",
            "subjonctif-plus-que-parfait": "subjonctif-imparfait",
        }
        avoir_forms = {
            "present": ["ai", "as", "a", "a", "a", "avons", "avez", "ont", "ont"],
            "imparfait": ["avais", "avais", "avait", "avait", "avait", "avions", "aviez", "avaient", "avaient"],
            "passe-simple": ["eus", "eus", "eut", "eut", "eut", "eûmes", "eûtes", "eurent", "eurent"],
            "futur-simple": ["aurai", "auras", "aura", "aura", "aura", "aurons", "aurez", "auront", "auront"],
            "conditionnel-present": ["aurais", "aurais", "aurait", "aurait", "aurait", "aurions", "auriez", "auraient", "auraient"],
            "subjonctif-present": ["aie", "aies", "ait", "ait", "ait", "ayons", "ayez", "aient", "aient"],
            "subjonctif-imparfait": ["eusse", "eusses", "eût", "eût", "eût", "eussions", "eussiez", "eussent", "eussent"],
        }
        etre_forms = {
            "present": ["suis", "es", "est", "est", "est", "sommes", "êtes", "sont", "sont"],
            "imparfait": ["étais", "étais", "était", "était", "était", "étions", "étiez", "étaient", "étaient"],
            "passe-simple": ["fus", "fus", "fut", "fut", "fut", "fûmes", "fûtes", "furent", "furent"],
            "futur-simple": ["serai", "seras", "sera", "sera", "sera", "serons", "serez", "seront", "seront"],
            "conditionnel-present": ["serais", "serais", "serait", "serait", "serait", "serions", "seriez", "seraient", "seraient"],
            "subjonctif-present": ["sois", "sois", "soit", "soit", "soit", "soyons", "soyez", "soient", "soient"],
            "subjonctif-imparfait": ["fusse", "fusses", "fût", "fût", "fût", "fussions", "fussiez", "fussent", "fussent"],
        }
        if tense == "imperatif-passe":
            aux_forms = ("sois-toi", "soyons-nous", "soyez-vous") if is_pronominal else ("aie", "ayons", "ayez")
            return [
                {"person": person, "form": aux + " " + agreed_participle(person),
                 "verb": display_lemma, "tense": tense}
                for (person, _), aux in zip(IMPERATIVE_PERSONS, aux_forms)
            ]
        key = aux_tense[tense]
        aux_forms = etre_forms[key] if auxiliary == "être" else avoir_forms[key]
        rows = []
        indices = [2] if impersonal else range(len(person_rows))
        for index in indices:
            person, _ = person_rows[index]
            form = reflexive_prefix(aux_forms[index], index) + " " + agreed_participle(person) if is_pronominal else aux_forms[index] + " " + participle
            rows.append({
                "person": subjunctive_labels[person] if tense.startswith("subjonctif-") else person,
                "form": form, "verb": display_lemma, "tense": tense,
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
    family = request.family
    selected_verb = normalize(request.verb)
    # Compatibilidad con clientes que aún clasifican estos infinitivos -ER como grupo 3.
    # Solo se normalizan alias de grupo; una familia ortográfica incompatible sigue rechazándose.
    if selected_verb in ETRE_PRIORITY_PARTICIPLES and family in ("premier-groupe", "premier-groupe-reguliers", "troisieme-groupe"):
        family = ""
    if family not in ("", "premier-groupe", "premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent", "deuxieme-groupe"):
        raise HTTPException(422, "Selecciona una familia de verbos válida.")
    # Aceptar la variante histórica usada por algunos clientes además del
    # valor canónico «non-pronominal».
    if request.construction not in ("", "pronominal", "non-pronominal", "non-pronomial"):
        raise HTTPException(422, "Selecciona una construcción verbal válida.")
    if request.auxiliary not in ("", "avoir", "etre"):
        raise HTTPException(422, "Selecciona un auxiliar válido.")
    category_mode = family in ("premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent", "deuxieme-groupe") and not request.verb.strip()
    if selected_verb == "neiger" and not category_mode:
        raise HTTPException(
            422,
            "«neiger» es un verbo impersonal y no admite una práctica individual de 20 preguntas. Puede aparecer en «Todos los verbos del primer grupo» en los tiempos compatibles.",
        )
    if request.tense in COMPOUND_TENSES and request.auxiliary == "etre":
        selected_verb = normalize(request.verb)
        is_pronominal_verb = selected_verb.startswith(("se ", "s'"))
        if selected_verb and selected_verb not in ETRE_PRIORITY_PARTICIPLES and not is_pronominal_verb:
            raise HTTPException(422, "Être solo está disponible para los verbos pronominales y los verbos configurados con prioridad de este auxiliar.")
        if not selected_verb and not category_mode:
            raise HTTPException(422, "Selecciona un verbo compatible con el auxiliar Être.")
    if category_mode:
        # Una pregunta por verbo: 20 infinitivos distintos elegidos al azar.
        # Cada categoría usa exclusivamente los verbos admitidos por el catálogo.
        available_verbs = list({"ger": ger_family_verbs, "cer": cer_family_verbs, "eler": eler_family_verbs, "eter": eter_family_verbs, "yer": yer_family_verbs, "e-accent": lambda: tuple(sorted(e_accent_family_patterns())), "deuxieme-groupe": lambda: second_group_verbs() + second_group_pronominal_verbs()}.get(family, lambda: regular_first_group_verbs())())
        pronomial_verbs = (
            set(second_group_pronominal_verbs())
            if family == "deuxieme-groupe"
            else set(pronominal_first_group_verbs())
        )
        if request.construction == "pronominal":
            available_verbs = [verb for verb in available_verbs if verb in pronomial_verbs]
        elif request.construction in ("non-pronomial", "non-pronominal"):
            available_verbs = [verb for verb in available_verbs if verb not in pronomial_verbs]
        if request.tense in COMPOUND_TENSES and request.auxiliary == "etre":
            available_verbs = [
                verb for verb in available_verbs
                if (family == "deuxieme-groupe" and verb in second_group_pronominal_verbs())
                or verb in ETRE_PRIORITY_PARTICIPLES
                or (request.construction == "pronominal" and verb.startswith(("se ", "s'")))
            ]
        elif family == "deuxieme-groupe" and request.tense in COMPOUND_TENSES and request.auxiliary == "avoir":
            available_verbs = [verb for verb in available_verbs if verb not in second_group_pronominal_verbs()]
        # Los verbos impersonales no admiten imperativo. Filtrarlos antes del
        # muestreo evita que un único candidato incompatible rompa la sesión.
        if family == "deuxieme-groupe" and request.tense in ("imperatif-present", "imperatif-passe"):
            pronominal_catalog = second_group_pronominal_catalog()
            available_verbs = [
                verb for verb in available_verbs
                if not pronominal_catalog.get(verb, {}).get("impersonal")
            ]
        if request.tense in ("imperatif-present", "imperatif-passe"):
            impersonal_catalog = impersonal_verb_catalog()
            available_verbs = [
                verb for verb in available_verbs
                if not impersonal_catalog.get(verb, {}).get("impersonal")
            ]
        if not available_verbs:
            raise HTTPException(422, "No hay verbos compatibles con esta familia y construcción en el catálogo.")
        # En el segundo grupo, la opción mixta conserva la proporción acordada:
        # 12 preguntas no pronominales (60 %) y 8 pronominales (40 %).
        selected_verbs = None
        if family == "deuxieme-groupe" and not request.construction and not request.auxiliary:
            pronominal_set = set(second_group_pronominal_verbs())
            pronominal_pool = [verb for verb in available_verbs if verb in pronominal_set]
            non_pronominal_pool = [verb for verb in available_verbs if verb not in pronominal_set]
            recent = set(RECENT_CATEGORY_VERBS)
            fresh_pronominal = [verb for verb in pronominal_pool if verb not in recent]
            fresh_non_pronominal = [verb for verb in non_pronominal_pool if verb not in recent]
            if len(fresh_pronominal) >= 8:
                pronominal_pool = fresh_pronominal
            if len(fresh_non_pronominal) >= 12:
                non_pronominal_pool = fresh_non_pronominal
            # Objetivo habitual: 12 no pronominales y 8 pronominales.
            # Si un tiempo excluye verbos impersonales, se ajusta la cuota sin
            # repetir infinitivos ni abandonar la sesión de 20 preguntas.
            pronominal_count = min(8, len(pronominal_pool))
            non_pronominal_count = min(20 - pronominal_count, len(non_pronominal_pool))
            remaining = 20 - pronominal_count - non_pronominal_count
            if remaining:
                extra_pronominal = min(remaining, len(pronominal_pool) - pronominal_count)
                pronominal_count += extra_pronominal
                remaining -= extra_pronominal
            if remaining:
                extra_non_pronominal = min(remaining, len(non_pronominal_pool) - non_pronominal_count)
                non_pronominal_count += extra_non_pronominal
                remaining -= extra_non_pronominal
            if remaining == 0:
                selected_verbs = (
                    random.sample(non_pronominal_pool, k=non_pronominal_count)
                    + random.sample(pronominal_pool, k=pronominal_count)
                )
                random.shuffle(selected_verbs)

        if selected_verbs is None:
            # Evitar repetir infinitivos recientes cuando haya suficientes candidatos.
            recent = set(RECENT_CATEGORY_VERBS)
            fresh_verbs = [verb for verb in available_verbs if verb not in recent]
            pool = fresh_verbs if len(fresh_verbs) >= min(20, len(available_verbs)) else available_verbs
            selected_verbs = random.sample(pool, k=20) if len(pool) >= 20 else random.choices(pool, k=20)
        RECENT_CATEGORY_VERBS.extend(selected_verbs)
        del RECENT_CATEGORY_VERBS[:-RECENT_CATEGORY_VERBS_LIMIT]
        questions = []
        for verb in selected_verbs:
            if family == "deuxieme-groupe":
                forms = second_group_forms(verb, request.tense)
            elif impersonal_verb_catalog().get(verb, {}).get("impersonal"):
                forms = impersonal_er_forms(verb, request.tense)
            else:
                forms = regular_er_forms(verb, request.tense, family)
            forms = expand_practice_etre_subject_variants(forms, verb, request.tense)
            form = random.choice(forms)
            questions.append({
                "person": form["person"],
                "person_key": form.get("person_key", form["person"]),
                "verb": form["verb"],
                "tense": form["tense"],
                "answer": form["form"],
                **{key: form[key] for key in ("subject_gender", "subject_number", "subject_variant") if key in form},
            })
    else:
        if not request.verb.strip():
            raise HTTPException(422, "Escribe un verbo o selecciona una familia para generar una práctica automática.")
        typed_pronominal = normalize(request.verb).startswith(("se ", "s'"))
        if request.construction == "pronominal" and not typed_pronominal:
            raise HTTPException(422, "La construcción seleccionada requiere un verbo pronominal, por ejemplo «se laver».")
        if request.construction in ("non-pronomial", "non-pronominal") and typed_pronominal:
            raise HTTPException(422, "El verbo escrito es pronominal; cambia el filtro de construcción.")
        if family == "ger" and normalize(request.verb) not in ger_family_verbs():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -GER compatible (manger, changer, nager…).")
        if family == "cer" and normalize(request.verb) not in cer_family_verbs():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -CER compatible (commencer, annoncer, avancer…).")
        if family == "eler" and normalize(request.verb) not in eler_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -ELER compatible.")
        if family == "eter" and normalize(request.verb) not in eter_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -ETER compatible.")
        if family == "yer" and normalize(request.verb) not in yer_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -YER compatible.")
        if family == "e-accent" and normalize(request.verb) not in e_accent_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia E (È) + CONSONANTE + ER compatible.")
        use_second_group = family == "deuxieme-groupe" or (not family and is_second_group_verb(selected_verb))
        if family == "deuxieme-groupe" and not is_second_group_verb(selected_verb):
            raise HTTPException(422, "El verbo escrito no pertenece al segundo grupo compatible.")
        if use_second_group:
            if family not in ("", "deuxieme-groupe"):
                raise HTTPException(422, "El verbo del segundo grupo no pertenece a la familia seleccionada.")
            pronominal_record = second_group_pronominal_catalog().get(selected_verb)
            if pronominal_record and pronominal_record.get("impersonal"):
                raise HTTPException(
                    422,
                    "«s'agir» es un verbo pronominal impersonal y no admite una práctica individual de 20 preguntas. Puede aparecer en «Todos los verbos del segundo grupo».",
                )
            if request.tense in COMPOUND_TENSES and request.auxiliary:
                expected_auxiliary = "etre" if typed_pronominal else "avoir"
                if request.auxiliary != expected_auxiliary:
                    raise HTTPException(422, "El auxiliar seleccionado no corresponde a este verbo.")
            forms = second_group_forms(request.verb, request.tense)
        else:
            forms = regular_er_forms(request.verb, request.tense, family)
        forms = expand_practice_etre_subject_variants(forms, request.verb, request.tense)
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
                    "person_key": form.get("person_key", form["person"]),
                    "verb": form["verb"],
                    "tense": form["tense"],
                    "answer": form["form"],
                    **{key: form[key] for key in ("subject_gender", "subject_number", "subject_variant") if key in form},
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
    accepted = {expected}
    verb = normalize(question.get("verb", ""))
    tense = question.get("tense", "")
    yer_patterns = yer_family_patterns()
    if yer_patterns.get(verb) == "pa:yer":
        person = question.get("person_key", question.get("person", ""))
        if tense in ("present", "subjonctif-present") and person not in ("nous", "vous", "que nous", "que vous"):
            if expected:
                accepted.add(expected.replace("i", "y", 1))
        elif tense == "imperatif-present" and person == "tu*":
            if expected:
                accepted.add(expected.replace("i", "y", 1))
        elif tense in ("futur-simple", "conditionnel-present"):
            accepted.add(expected.replace("ier", "yer"))
    if (
        verb.startswith(("se ", "s'"))
        and tense in COMPOUND_TENSES
        and verb not in PRONOMINAL_NO_SUBJECT_AGREEMENT
        and not question.get("subject_gender")
    ):
        prefix, separator, past_participle = expected.rpartition(" ")
        if separator and past_participle.endswith("é"):
            for ending in ("é", "ée", "és", "ées"):
                accepted.add(prefix + " " + past_participle[:-1] + ending)
    correct = bool(actual) and actual in accepted
    return {"correct": correct, "expected": question["answer"]}


@app.get("/")
def index():
    return FileResponse(ROOT / "index.html")


# Servir los recursos estáticos en el mismo origen que la API durante el desarrollo.
app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")
