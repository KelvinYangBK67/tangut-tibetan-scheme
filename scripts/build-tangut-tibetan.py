"""Build the browser's direct Tangut-to-Tibetan lookup table.

Native rhyme class, tone, and initial class come from
nkay0/Tangut-rhyme-dictionaries-data.  GX and the BabelStone/XHZD database
supply only temporary onset analyses; their rhymes and tones never determine
the output.  scripts/render-tangut-tibetan.js applies this project's R.1-R.105
orthographic rules and the native Class-IV override.
"""

from __future__ import annotations

import argparse
import csv
import json
import sqlite3
import subprocess
import sys
from collections import defaultdict
from pathlib import Path


def read_native(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        rows = list(csv.DictReader(source))
    required = {"文字", "Unicode", "声母", "総合韻", "声調", "文海", "文海寶韻", "sort(文海)"}
    missing = required - set(rows[0] if rows else {})
    if missing:
        raise RuntimeError(f"Native source is missing columns: {', '.join(sorted(missing))}")
    return rows


def read_bootstrap(path: Path) -> dict[str, str]:
    database = sqlite3.connect(path)
    records = database.execute(
        "SELECT xhzd_index, unicode, gong_huangcheng_reading, canonical_form "
        "FROM xhzd_pronunciations"
    ).fetchall()
    database.close()
    by_character: dict[str, list[tuple[int, str, str | None, int | None]]] = defaultdict(list)
    by_index = {record[0]: record for record in records}
    for record in records:
        by_character[record[1]].append(record)

    readings: dict[str, str] = {}
    for character, candidates in by_character.items():
        direct = next((record[2] for record in candidates if record[2]), None)
        if direct:
            readings[character] = direct
            continue
        for record in candidates:
            canonical = by_index.get(record[3]) if record[3] else None
            if canonical and canonical[2]:
                readings[character] = canonical[2]
                break
    return readings


def read_gx_bootstrap(path: Path) -> dict[str, str]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        rows = csv.DictReader(source, delimiter="\t")
        return {row["unicode"]: row["GX202411"] for row in rows if row["unicode"] and row["GX202411"]}


def source_priority(row: dict[str, str]) -> tuple[int, float]:
    if row["文海"]:
        rank = 0
    elif row["文海寶韻"]:
        rank = 1
    else:
        rank = 2
    try:
        order = float(row["sort(文海)"])
    except ValueError:
        order = float("inf")
    return rank, order


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    parser = argparse.ArgumentParser()
    parser.add_argument("native_csv", type=Path)
    parser.add_argument("babelstone_sqlite", type=Path)
    parser.add_argument("gx_tsv", type=Path)
    parser.add_argument("output_csv", type=Path)
    args = parser.parse_args()

    native_rows = read_native(args.native_csv)
    readings = read_bootstrap(args.babelstone_sqlite)
    gx_readings = read_gx_bootstrap(args.gx_tsv)
    candidates: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in native_rows:
        if row["文字"] and row["総合韻"].isdigit() and 1 <= int(row["総合韻"]) <= 105 and row["声調"] in {"1", "2"}:
            candidates[row["文字"]].append(row)

    selected = {character: min(rows, key=source_priority) for character, rows in candidates.items()}
    entries = []
    missing_bootstrap = []
    for character in sorted(selected, key=ord):
        row = selected[character]
        gx = gx_readings.get(character)
        ghc = readings.get(character, "")
        if not gx and not ghc:
            missing_bootstrap.append(character)
            continue
        entries.append({
            "tangut": character,
            "gx": gx,
            "ghc": ghc,
            "rhyme": row["総合韻"],
            "tone": row["声調"],
            "initialClass": row["声母"],
        })

    renderer = Path(__file__).with_name("render-tangut-tibetan.js")
    process = subprocess.run(
        ["node", str(renderer)],
        input=json.dumps(entries, ensure_ascii=False),
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )
    if process.returncode:
        raise RuntimeError(process.stderr or f"Renderer failed with exit code {process.returncode}")
    result = json.loads(process.stdout)
    if len(result["rows"]) < 5_500:
        samples = "; ".join(
            f"{error['tangut']} {error.get('gx') or error['ghc']} R.{error['rhyme']}: {error['message']}"
            for error in result["errors"][:10]
        )
        raise RuntimeError(f"Only {len(result['rows'])} mappings were generated. {samples}")

    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.output_csv.open("w", encoding="utf-8", newline="") as target:
        writer = csv.writer(target, lineterminator="\n")
        writer.writerow(["tangut", "tibetan"])
        writer.writerows(result["rows"])

    print(
        f"generated={len(result['rows'])} "
        f"missing_bootstrap={len(missing_bootstrap)} "
        f"unparseable={len(result['errors'])}"
    )
    if result["errors"]:
        for error in result["errors"][:20]:
            print(f"unparseable {error['tangut']} {error.get('gx') or error['ghc']} R.{error['rhyme']}: {error['message']}")


if __name__ == "__main__":
    main()
