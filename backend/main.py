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
        if entry.get("pattern") in {"man:ger", "abr:éger"} and entry.get("pronominal") in (False, True) and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale") and lemma.endswith("ger") and lemma:
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
            entry.get("pattern") in {"pla:cer", "dép:ecer"}
            and entry.get("pronominal") in (False, True)
            and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale")
            and lemma.endswith("cer")
            and lemma
        ):
            candidates.append(display_lemma)
    return tuple(sorted(set(candidates)))


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
        if (
            entry.get("groupe") != 1
            or entry.get("familyId") != "er-regular"
            or entry.get("pronominal") not in (False, True)
            or entry.get("construction") not in ("non-pronomiale", "non-pronominale", "pronomiale")
            or not lemma
        ):
            continue
        try:
            regular_er_forms(display_lemma, "present")
        except HTTPException:
            continue
        candidates.append(display_lemma)

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
        payload = source[prefix_index + len(prefix):].strip().split(";\\nwindow.", 1)[0].strip()
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
        if (
            entry.get("groupe") == 1
            and entry.get("familyId") == "er-regular"
            and entry.get("pronominal") is True
            and entry.get("construction") == "pronomiale"
            and display_lemma
        ):
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
            entry.get("pronominal") in (False, True)
            and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale")
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
            entry.get("pronominal") in (False, True)
            and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale")
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
            entry.get("pronominal") in (False, True)
            and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale")
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
        if entry.get("pronominal") in (False, True) and entry.get("construction") in ("non-pronomiale", "non-pronominale", "pronomiale") and lemma.endswith("yer") and pattern in supported:
            patterns[display_lemma] = pattern
    return patterns


def yer_family_verbs() -> tuple[str, ...]:
    return tuple(sorted(yer_family_patterns()))


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFC", value or "").lower().replace("’", "'")
    return re.sub(r"\s+", " ", value.strip())


def regular_er_forms(verb: str, tense: str, family: str = "") -> list[dict[str, str]]:
    """Conjugate a regular first-group -ER verb in the selected tense."""
    display_lemma = normalize(verb)
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
        if form[:1] in "aeiouyàâéèêëîïôùûüœæh":
            pronoun = {"me": "m'", "te": "t'", "se": "s'"}.get(pronoun, pronoun)
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
    if request.family not in ("", "premier-groupe", "premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent"):
        raise HTTPException(422, "Selecciona una familia de verbos válida.")
    # Aceptar la variante histórica usada por algunos clientes además del
    # valor canónico «non-pronominal».
    if request.construction not in ("", "pronominal", "non-pronominal", "non-pronomial"):
        raise HTTPException(422, "Selecciona una construcción verbal válida.")
    if request.tense in COMPOUND_TENSES and request.auxiliary == "etre":
        raise HTTPException(422, "« Parler » utiliza el auxiliar avoir en los tiempos compuestos. Selecciona Avoir o ambos auxiliares.")
    if request.auxiliary not in ("", "avoir", "etre"):
        raise HTTPException(422, "Selecciona un auxiliar válido.")

    category_mode = request.family in ("premier-groupe-reguliers", "ger", "cer", "eler", "eter", "yer", "e-accent") and not request.verb.strip()
    if category_mode:
        # Una pregunta por verbo: 20 infinitivos distintos elegidos al azar.
        # Cada categoría usa exclusivamente los verbos admitidos por el catálogo.
        available_verbs = list({"ger": ger_family_verbs, "cer": cer_family_verbs, "eler": eler_family_verbs, "eter": eter_family_verbs, "yer": yer_family_verbs, "e-accent": lambda: tuple(sorted(e_accent_family_patterns()))}.get(request.family, lambda: regular_first_group_verbs())())
        pronomial_verbs = set(pronominal_first_group_verbs())
        if request.construction == "pronominal":
            available_verbs = [verb for verb in available_verbs if verb in pronomial_verbs]
        elif request.construction in ("non-pronomial", "non-pronominal"):
            available_verbs = [verb for verb in available_verbs if verb not in pronomial_verbs]
        if not available_verbs:
            raise HTTPException(422, "No hay verbos compatibles con esta familia y construcción en el catálogo.")
        # Evitar repetir infinitivos recientes cuando haya suficientes candidatos.
        recent = set(RECENT_CATEGORY_VERBS)
        fresh_verbs = [verb for verb in available_verbs if verb not in recent]
        pool = fresh_verbs if len(fresh_verbs) >= min(20, len(available_verbs)) else available_verbs
        selected_verbs = random.sample(pool, k=20) if len(pool) >= 20 else random.choices(pool, k=20)
        RECENT_CATEGORY_VERBS.extend(selected_verbs)
        del RECENT_CATEGORY_VERBS[:-RECENT_CATEGORY_VERBS_LIMIT]
        questions = []
        for verb in selected_verbs:
            forms = regular_er_forms(verb, request.tense, request.family)
            form = random.choice(forms)
            questions.append({
                "person": form["person"],
                "verb": form["verb"],
                "tense": form["tense"],
                "answer": form["form"],
            })
    else:
        if not request.verb.strip():
            raise HTTPException(422, "Escribe un verbo o selecciona una familia para generar una práctica automática.")
        typed_pronominal = normalize(request.verb).startswith(("se ", "s'"))
        if request.construction == "pronominal" and not typed_pronominal:
            raise HTTPException(422, "La construcción seleccionada requiere un verbo pronominal, por ejemplo «se laver».")
        if request.construction in ("non-pronomial", "non-pronominal") and typed_pronominal:
            raise HTTPException(422, "El verbo escrito es pronominal; cambia el filtro de construcción.")
        if request.family == "ger" and normalize(request.verb) not in ger_family_verbs():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -GER compatible (manger, changer, nager…).")
        if request.family == "cer" and normalize(request.verb) not in cer_family_verbs():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia ortográfica -CER compatible (commencer, annoncer, avancer…).")
        if request.family == "eler" and normalize(request.verb) not in eler_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -ELER compatible.")
        if request.family == "eter" and normalize(request.verb) not in eter_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -ETER compatible.")
        if request.family == "yer" and normalize(request.verb) not in yer_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia -YER compatible.")
        if request.family == "e-accent" and normalize(request.verb) not in e_accent_family_patterns():
            raise HTTPException(422, "El verbo escrito no pertenece a la familia E (È) + CONSONANTE + ER compatible.")
        forms = regular_er_forms(request.verb, request.tense, request.family)
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
    accepted = {expected}
    verb = normalize(question.get("verb", ""))
    tense = question.get("tense", "")
    yer_patterns = yer_family_patterns()
    if yer_patterns.get(verb) == "pa:yer":
        person = question.get("person", "")
        if tense in ("present", "subjonctif-present") and person not in ("nous", "vous", "que nous", "que vous"):
            if expected:
                accepted.add(expected.replace("i", "y", 1))
        elif tense == "imperatif-present" and person == "tu*":
            if expected:
                accepted.add(expected.replace("i", "y", 1))
        elif tense in ("futur-simple", "conditionnel-present"):
            accepted.add(expected.replace("ier", "yer"))
    if verb.startswith(("se ", "s'")) and tense in COMPOUND_TENSES and verb not in {"se parler", "se téléphoner", "se demander"}:
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
