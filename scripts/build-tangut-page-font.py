"""Subset the complete Tangut WOFF2 to characters used by the scheme page."""

from __future__ import annotations

import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def cmap(path: Path) -> set[int]:
    with TTFont(path) as font:
        return set().union(*(table.cmap for table in font["cmap"].tables))


def is_tangut(codepoint: int) -> bool:
    return codepoint == 0x16FE0 or 0x17000 <= codepoint <= 0x18DFF


def build(source: Path, page: Path, output: Path) -> None:
    page_codepoints = {ord(character) for character in page.read_text(encoding="utf-8")}
    codepoints = {cp for cp in cmap(source) & page_codepoints if is_tangut(cp)}
    if not codepoints:
        raise RuntimeError("The page contains no characters from the Tangut font")

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.recommended_glyphs = True
    options.notdef_glyph = True
    options.notdef_outline = True
    font = subset.load_font(str(source), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    subset.save_font(font, str(output), options)
    print(f"Generated {output.name} with {len(codepoints)} page characters")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("page", type=Path)
    parser.add_argument("output", type=Path)
    arguments = parser.parse_args()
    build(arguments.source.resolve(), arguments.page.resolve(), arguments.output.resolve())
