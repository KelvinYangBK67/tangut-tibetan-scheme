"""Build the direct Tangut-to-Tibetan table with auditable inference.

Native rhyme class and tone are authoritative. GX supplies primarily the
onset; GHC is an onset fallback and a rhyme-class auxiliary. Missing native
fields may be recovered only through explicit native relations or a unique
GHC-to-native rhyme mapping. The JavaScript renderer remains the sole owner of
Tibetan orthographic generation.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sqlite3
import subprocess
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path


CHAR = "文字"
CANONICAL = "正字"
INITIAL_CLASS = "声母"
HOMOPHONE_GROUP = "新版同音 小類"
OLD_INITIAL_CLASS = "旧版同音 声母"
OLD_HOMOPHONE_GROUP = "旧版同音 小類"
RHYME = "総合韻"
TONE = "声調"
TONE_RHYME = "声調韻"
WENHAI = "文海"
WENHAI_TREASURE = "文海寶韻"
SORT_WENHAI = "sort(文海)"
FANQIE_UPPER = ("文海 反切上字", "合編 反切A上字", "合編 反切B上字")
FANQIE_LOWER = ("文海 反切下字", "合編 反切A下字")


def valid_rhyme(row: dict[str, str]) -> bool:
    return row[RHYME].isdigit() and 1 <= int(row[RHYME]) <= 105


def valid_tone(value: str) -> bool:
    return value in {"1", "2"}


def relation_character(value: str) -> str:
    value = value.strip()
    if re.fullmatch(r"U\+[0-9A-Fa-f]{5,6}", value):
        return chr(int(value[2:], 16))
    return value if len(value) == 1 and 0x17000 <= ord(value) <= 0x18D7F else ""


def source_priority(row: dict[str, str]) -> tuple[int, float]:
    rank = 0 if row[WENHAI] else 1 if row[WENHAI_TREASURE] else 2
    try:
        order = float(row[SORT_WENHAI])
    except ValueError:
        order = float("inf")
    return rank, order


def read_native(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        rows = list(csv.DictReader(source))
    required = {
        CHAR, CANONICAL, INITIAL_CLASS, HOMOPHONE_GROUP, OLD_INITIAL_CLASS,
        OLD_HOMOPHONE_GROUP, RHYME, TONE, TONE_RHYME, WENHAI,
        WENHAI_TREASURE, SORT_WENHAI, *FANQIE_UPPER, *FANQIE_LOWER,
    }
    missing = required - set(rows[0] if rows else {})
    if missing:
        raise RuntimeError(f"Native source is missing columns: {', '.join(sorted(missing))}")
    return rows


def read_ghc(path: Path) -> dict[str, list[dict[str, object]]]:
    database = sqlite3.connect(path)
    records = database.execute(
        "SELECT xhzd_index, unicode, is_variant, canonical_form, "
        "gong_huangcheng_reading, rhyme_class, initial_class, dubious_reading, "
        "incomplete_reading, dubious_rhyme FROM xhzd_pronunciations"
    ).fetchall()
    database.close()
    by_index = {record[0]: record for record in records}
    result: dict[str, list[dict[str, object]]] = defaultdict(list)
    for record in records:
        canonical = by_index.get(record[3]) if record[3] else None
        reading = record[4] or (canonical[4] if canonical else "")
        rhyme_class = record[5] or (canonical[5] if canonical else "")
        initial_class = record[6] or (canonical[6] if canonical else "")
        result[record[1]].append({
            "reading": reading or "",
            "rhyme_class": rhyme_class or "",
            "initial_class": initial_class or "",
            "dubious": bool(record[7] or record[8] or record[9] or canonical and (canonical[7] or canonical[8] or canonical[9])),
            "canonical": canonical[1] if canonical else "",
        })
    return result


def read_gx(path: Path) -> dict[str, str]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        rows = csv.DictReader(source, delimiter="\t")
        return {row["unicode"]: row["GX202411"] for row in rows if row["unicode"] and row["GX202411"]}


def read_ghc_to_gx(path: Path) -> dict[str, str]:
    candidates: dict[str, set[str]] = defaultdict(set)
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source, delimiter="\t"):
            ghc_body = unicodedata.normalize("NFC", re.sub(r"[¹²?]$", "", row.get("GHC", "")))
            gx_body = unicodedata.normalize("NFC", re.sub(r"[¹²?]$", "", row.get("GX202411", "")))
            if ghc_body and gx_body:
                candidates[ghc_body].add(gx_body)
    return {reading: next(iter(values)) for reading, values in candidates.items() if len(values) == 1}


def canonicalize_legacy_gx(reading: str, ghc_to_gx: dict[str, str]) -> str:
    """Map a complete legacy GX/GHC-form reading to GX202411 when unambiguous."""
    tone_match = re.search(r"[¹²?]$", reading)
    tone = tone_match.group(0) if tone_match else "?"
    body = unicodedata.normalize("NFC", re.sub(r"[¹²?]$", "", reading))
    if body.endswith("uə"):
        return body[:-2] + "wə̱" + tone
    if body in ghc_to_gx and ghc_to_gx[body] != body:
        return ghc_to_gx[body] + tone
    return ""


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    parser = argparse.ArgumentParser()
    parser.add_argument("native_csv", type=Path)
    parser.add_argument("babelstone_sqlite", type=Path)
    parser.add_argument("gx_tsv", type=Path)
    parser.add_argument("output_csv", type=Path)
    parser.add_argument("--audit", type=Path)
    parser.add_argument("--unresolved", type=Path)
    parser.add_argument("--unicode-data", type=Path)
    args = parser.parse_args()

    native_rows = read_native(args.native_csv)
    by_character: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in native_rows:
        if row[CHAR]:
            by_character[row[CHAR]].append(row)
    gx = read_gx(args.gx_tsv)
    ghc = read_ghc(args.babelstone_sqlite)

    # Learn conservative GHC -> canonical GX spellings from characters for
    # which both databases provide a direct reading. This admits older GHC
    # strings such as khiwə without expanding the public parser grammar.
    ghc_to_gx_candidates: dict[str, set[str]] = defaultdict(set)
    for character, gx_reading in gx.items():
        gx_body = re.sub(r"[¹²?]$", "", gx_reading)
        for record in ghc.get(character, []):
            if record["reading"]:
                ghc_to_gx_candidates[unicodedata.normalize("NFC", str(record["reading"]))].add(gx_body)
    ghc_to_gx = {
        reading: next(iter(candidates))
        for reading, candidates in ghc_to_gx_candidates.items()
        if len(candidates) == 1
    }
    ghc_to_gx.update(read_ghc_to_gx(args.gx_tsv))
    # GHC tone.rhyme identifiers are mapped back to native R.x only where the
    # native table gives one unique answer.
    ghc_rhyme_map: dict[str, set[int]] = defaultdict(set)
    for row in native_rows:
        if valid_rhyme(row) and valid_tone(row[TONE]) and row[TONE_RHYME].isdigit():
            ghc_rhyme_map[f"{row[TONE]}.{int(row[TONE_RHYME])}"].add(int(row[RHYME]))
    ghc_rhyme_map = {key: value for key, values in ghc_rhyme_map.items() if len(values) == 1 for value in values}

    homophone_groups: dict[tuple[str, str, str], set[str]] = defaultdict(set)
    for row in native_rows:
        for edition, initial_key, group_key in (
            ("new", INITIAL_CLASS, HOMOPHONE_GROUP),
            ("old", OLD_INITIAL_CLASS, OLD_HOMOPHONE_GROUP),
        ):
            if row[initial_key] not in {"", "?"} and row[group_key]:
                homophone_groups[(edition, row[initial_key], row[group_key])].add(row[CHAR])

    direct_native: dict[str, tuple[int, str, dict[str, str]]] = {}
    for character, rows in by_character.items():
        candidates = [row for row in rows if valid_rhyme(row) and valid_tone(row[TONE])]
        if candidates:
            # Multiple attested readings are not an inferential conflict. Keep
            # the established 文海 → 文海寶韻 source priority for the one-form
            # character lookup, exactly as the previous generator did.
            row = min(candidates, key=source_priority)
            direct_native[character] = (int(row[RHYME]), row[TONE], row)

    def related_native(character: str):
        evidence = []
        for row in by_character.get(character, []):
            canonical = relation_character(row[CANONICAL])
            if canonical in direct_native:
                evidence.append(("native-canonical", canonical, direct_native[canonical][:2], False))
            for field in FANQIE_LOWER:
                related = relation_character(row[field])
                if related in direct_native:
                    evidence.append((f"native-{field}", related, direct_native[related][:2], True))
        pairs = {item[2] for item in evidence}
        return evidence if len(pairs) == 1 else []

    def ghc_rhyme(character: str):
        evidence = []
        for record in ghc.get(character, []):
            key = str(record["rhyme_class"])
            if key in ghc_rhyme_map and re.fullmatch(r"[12]\.\d+", key):
                evidence.append(("ghc-rhyme-class", key, (ghc_rhyme_map[key], key[0]), True))
        pairs = {item[2] for item in evidence}
        return evidence if len(pairs) == 1 else []

    def onset_evidence(character: str):
        if character in gx:
            return [("gx-direct", character, "gx", gx[character], False)]
        direct_ghc = [record for record in ghc.get(character, []) if record["reading"]]
        if direct_ghc:
            return [("ghc-direct", character, "ghc", str(record["reading"]), bool(record["dubious"])) for record in direct_ghc]

        related: list[tuple[str, str, str, str, bool]] = []
        for native_row in by_character.get(character, []):
            canonical = relation_character(native_row[CANONICAL])
            if canonical:
                if canonical in gx:
                    related.append(("gx-canonical", canonical, "gx", gx[canonical], False))
                else:
                    related.extend(("ghc-canonical", canonical, "ghc", str(record["reading"]), bool(record["dubious"])) for record in ghc.get(canonical, []) if record["reading"])
            for field in FANQIE_UPPER:
                upper = relation_character(native_row[field])
                if upper in gx:
                    related.append((f"gx-{field}", upper, "gx", gx[upper], True))
                elif upper:
                    related.extend((f"ghc-{field}", upper, "ghc", str(record["reading"]), True) for record in ghc.get(upper, []) if record["reading"])

            for edition, initial_key, group_key in (
                ("new", INITIAL_CLASS, HOMOPHONE_GROUP),
                ("old", OLD_INITIAL_CLASS, OLD_HOMOPHONE_GROUP),
            ):
                key = (edition, native_row[initial_key], native_row[group_key])
                for peer in homophone_groups.get(key, set()) - {character}:
                    if peer in gx:
                        related.append((f"gx-{edition}-homophone", peer, "gx", gx[peer], False))
                    else:
                        related.extend((f"ghc-{edition}-homophone", peer, "ghc", str(record["reading"]), bool(record["dubious"])) for record in ghc.get(peer, []) if record["reading"])
        return related

    entries = []
    audit_seed = {}
    unresolved_seed = []
    all_characters = set(by_character) | set(ghc) | set(gx)
    if args.unicode_data:
        all_characters.update(chr(codepoint) for codepoint in range(0x17000, 0x18800))
        pending = None
        for raw in args.unicode_data.read_text(encoding="utf-8").splitlines():
            fields = raw.split(";")
            codepoint, name = int(fields[0], 16), fields[1]
            if name == "<Tangut Ideograph Supplement, First>":
                pending = codepoint
            elif name == "<Tangut Ideograph Supplement, Last>" and pending is not None:
                all_characters.update(chr(value) for value in range(pending, codepoint + 1))
                pending = None
    for character in sorted(all_characters, key=ord):
        native = direct_native.get(character)
        rhyme_evidence = []
        fallback_readings = []
        if native:
            rhyme, tone, _ = native
            rhyme_evidence = [("native-direct", character, (rhyme, tone), False)]
        else:
            rhyme_evidence = related_native(character) or ghc_rhyme(character)
            if not rhyme_evidence:
                # A complete GX/GHC reading is still usable when native R.x
                # cannot be recovered. Render its ordinary (Grade-III)
                # spelling and mark the lost native distinction as uncertain.
                if character in gx:
                    mapped_gx = canonicalize_legacy_gx(gx[character], ghc_to_gx)
                    if mapped_gx:
                        fallback_readings.append({
                            "kind": "gx",
                            "reading": mapped_gx,
                            "source": "gx-direct-mapped-fallback",
                        })
                    fallback_readings.append({"kind": "gx", "reading": gx[character], "source": "gx-direct-fallback"})
                direct_ghc = [record for record in ghc.get(character, []) if record["reading"]]
                for record in direct_ghc:
                    ghc_tone = str(record["rhyme_class"])[0] if re.fullmatch(r"[12]\.\d+", str(record["rhyme_class"])) else "?"
                    normalized_ghc = unicodedata.normalize("NFC", str(record["reading"]))
                    if normalized_ghc in ghc_to_gx:
                        fallback_readings.append({
                            "kind": "gx",
                            "reading": ghc_to_gx[normalized_ghc] + ({"1": "¹", "2": "²"}.get(ghc_tone, "?")),
                            "source": "ghc-direct-mapped-fallback",
                        })
                    fallback_readings.append(
                        {
                            "kind": "ghc",
                            "reading": str(record["reading"]),
                            "tone": ghc_tone,
                            "source": "ghc-direct-fallback",
                        }
                    )
                if not fallback_readings:
                    unresolved_seed.append((character, "rhyme-tone", "no unique native R.x and no direct GX/GHC reading"))
                    continue
                rhyme = None
                tone = "?"
                rhyme_evidence = [(fallback_readings[0]["source"], character, ("grade-III-default", tone), True)]
            else:
                rhyme, tone = rhyme_evidence[0][2]

        onsets = [] if fallback_readings else onset_evidence(character)
        if not fallback_readings and not onsets:
            unresolved_seed.append((character, "onset", "no direct or relational GX/GHC onset evidence"))
            continue
        initial_classes = {r[INITIAL_CLASS] for r in by_character.get(character, []) if r.get(INITIAL_CLASS) not in {"", "?"}}
        initial_class = next(iter(initial_classes)) if len(initial_classes) == 1 else ""
        reliable_rhyme_sources = {"native-direct", "native-canonical"}
        uncertain = rhyme_evidence[0][0] not in reliable_rhyme_sources or any(
            "反切上字" in item[0] for item in onsets
        )
        entries.append({
            "tangut": character,
            "rhyme": rhyme,
            "tone": tone,
            "initialClass": initial_class,
            "uncertain": uncertain,
            "onsets": [{"kind": item[2], "reading": item[3], "source": item[0], "character": item[1]} for item in onsets],
            "fallbackReadings": fallback_readings,
        })
        audit_seed[character] = {
            "rhyme_source": ";".join(f"{item[0]}:{item[1]}" for item in rhyme_evidence),
            "onset_source": ";".join(f"{item[0]}:{item[1]}" for item in onsets),
            "uncertain": uncertain,
        }

    renderer = Path(__file__).with_name("render-tangut-tibetan.js")
    process = subprocess.run(
        ["node", str(renderer)], input=json.dumps(entries, ensure_ascii=False),
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    if process.returncode:
        raise RuntimeError(process.stderr or f"Renderer failed with exit code {process.returncode}")
    result = json.loads(process.stdout)
    if len(result["rows"]) < 5_500:
        raise RuntimeError(f"Only {len(result['rows'])} mappings were generated")

    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.output_csv.open("w", encoding="utf-8", newline="") as target:
        writer = csv.writer(target, lineterminator="\n")
        writer.writerow(["tangut", "tibetan"])
        writer.writerows(result["rows"])

    if args.audit:
        args.audit.parent.mkdir(parents=True, exist_ok=True)
        rendered = dict(result["rows"])
        with args.audit.open("w", encoding="utf-8-sig", newline="") as target:
            writer = csv.writer(target)
            writer.writerow(["tangut", "tibetan", "rhyme_source", "onset_source", "uncertain"])
            for character in sorted(rendered, key=ord):
                item = audit_seed[character]
                writer.writerow([character, rendered[character], item["rhyme_source"], item["onset_source"], item["uncertain"]])

    renderer_errors = [(item["tangut"], "renderer", item["message"]) for item in result["errors"]]
    unresolved = unresolved_seed + renderer_errors
    if args.unresolved:
        args.unresolved.parent.mkdir(parents=True, exist_ok=True)
        with args.unresolved.open("w", encoding="utf-8-sig", newline="") as target:
            writer = csv.writer(target)
            writer.writerow(["tangut", "stage", "reason"])
            writer.writerows(unresolved)

    uncertain_count = sum(tibetan.endswith("†") for _, tibetan in result["rows"])
    print(f"generated={len(result['rows'])} uncertain={uncertain_count} unresolved={len(unresolved)} renderer_errors={len(result['errors'])}")


if __name__ == "__main__":
    main()
