"""Convert COQ's generated JavaScript verb database to pure JSON.

This script is intentionally one-way and non-destructive:
- reads data/verbs/local-database.js;
- extracts window.COQ_VERBS;
- parses the payload as JSON;
- validates the minimum COQ verb contract;
- writes backend/data/verbs/verbs.json.

It does not execute JavaScript and does not modify the source database.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REQUIRED_FIELDS = (
    "id",
    "infinitif",
    "infinitif_base",
    "groupe",
    "auxiliaire",
    "pronominal",
    "participePasse",
    "formes",
)


def extract_coq_verbs(source: str) -> dict:
    marker = "window.COQ_VERBS"
    start = source.find(marker)
    if start == -1:
        raise ValueError("No se encontró window.COQ_VERBS en el archivo fuente.")

    assignment = source.find("=", start + len(marker))
    if assignment == -1:
        raise ValueError("No se encontró la asignación de window.COQ_VERBS.")

    payload = source[assignment + 1 :].strip()

    # local-database.js is generated with JSON.stringify(...), so the first
    # complete JSON object can be decoded directly. We deliberately do not
    # eval/execute JavaScript.
    decoder = json.JSONDecoder()
    try:
        data, _ = decoder.raw_decode(payload)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "El contenido de window.COQ_VERBS no es JSON válido. "
            "No se realizará ninguna conversión."
        ) from exc

    if not isinstance(data, dict):
        raise ValueError("window.COQ_VERBS debe ser un objeto JSON.")

    return data


def validate(data: dict) -> None:
    errors: list[str] = []

    for key, record in data.items():
        if not isinstance(record, dict):
            errors.append(f"{key}: el registro no es un objeto.")
            continue

        for field in REQUIRED_FIELDS:
            if field not in record:
                errors.append(f"{key}: falta el campo requerido '{field}'.")

        if record.get("id") not in (None, key):
            errors.append(f"{key}: id no coincide con la clave del registro.")

        if not isinstance(record.get("formes", {}), dict):
            errors.append(f"{key}: 'formes' debe ser un objeto.")

        if record.get("groupe") not in (1, 2, 3):
            errors.append(f"{key}: groupe debe ser 1, 2 o 3.")

        if record.get("auxiliaire") not in (None, "avoir", "être"):
            errors.append(f"{key}: auxiliar desconocido.")

        if not isinstance(record.get("pronominal"), bool):
            errors.append(f"{key}: pronominal debe ser booleano.")

    if errors:
        preview = "\n".join(f"- {error}" for error in errors[:30])
        more = f"\n... y {len(errors) - 30} errores más." if len(errors) > 30 else ""
        raise ValueError(f"Validación fallida ({len(errors)} errores):\n{preview}{more}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("data/verbs/local-database.js"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("backend/data/verbs/verbs.json"),
    )
    args = parser.parse_args()

    source = args.source
    output = args.output

    if not source.exists():
        raise SystemExit(f"No existe el archivo fuente: {source}")

    data = extract_coq_verbs(source)
    validate(data)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"OK: {len(data)} verbos convertidos.")
    print(f"Fuente: {source}")
    print(f"Destino: {output}")


if __name__ == "__main__":
    main()
