from pathlib import Path
import re
import subprocess

from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]


def kpsewhich(name: str) -> Path:
    result = subprocess.run(
        ["kpsewhich", name], check=True, capture_output=True, text=True
    ).stdout.strip()
    if not result:
        raise RuntimeError(f"Font not found through kpsewhich: {name}")
    return Path(result)


template_root = kpsewhich("nextart_zh.cls").parent
asset_root = template_root / "assets" / "fonts"
checks = [
    (kpsewhich("LibertinusSans-Regular.otf"), "LibertinusSans-Regular.woff2"),
    (kpsewhich("LibertinusSans-Bold.otf"), "LibertinusSans-Bold.woff2"),
    (kpsewhich("LibertinusSans-Italic.otf"), "LibertinusSans-Italic.woff2"),
    (asset_root / "shanggu" / "ShangguSans-Regular.ttf", "ShangguSans-Regular.woff2"),
    (asset_root / "shanggu" / "ShangguSans-Bold.ttf", "ShangguSans-Bold.woff2"),
    (asset_root / "tibetan" / "NotoSerifTibetan-Regular.ttf", "NotoSerifTibetan-Regular.woff2"),
    (asset_root / "tangut" / "NotoSerifTangut-Regular.ttf", "NotoSerifTangut-Regular.woff2"),
]


def characters(path: Path) -> set[int]:
    with TTFont(path) as font:
        return set().union(*(table.cmap for table in font["cmap"].tables))


for source, output_name in checks:
    output = ROOT / "fonts" / output_name
    source_chars = characters(source)
    output_chars = characters(output)
    missing = source_chars - output_chars
    print(
        f"{output_name}: source={len(source_chars)} "
        f"woff2={len(output_chars)} missing={len(missing)}"
    )
    if missing:
        sample = " ".join(f"U+{codepoint:04X}" for codepoint in sorted(missing)[:10])
        raise AssertionError(f"{output_name} is missing source characters: {sample}")

print(f"ok - {len(checks)} complete webfonts retain their source cmap")

chunk_css = (ROOT / "fonts" / "shanggu-web.css").read_text(encoding="utf-8")
if len(chunk_css.encode("utf-8")) >= 20_000:
    raise AssertionError("Shanggu chunk CSS grew beyond the 20 KB performance budget")
if "font-display: swap" not in chunk_css:
    raise AssertionError("Shanggu chunk CSS must keep font-display: swap")
css_files = set(re.findall(r'url\("shanggu-web/([^?"\)]+)\?v=', chunk_css))
disk_files = {path.name for path in (ROOT / "fonts" / "shanggu-web").glob("*.woff2")}
if css_files != disk_files:
    raise AssertionError(
        f"Shanggu CSS/file mismatch: css-only={css_files - disk_files} "
        f"disk-only={disk_files - css_files}"
    )
core_bytes = sum(
    path.stat().st_size
    for path in (ROOT / "fonts" / "shanggu-web").glob("*-core.woff2")
)
if core_bytes >= 150_000:
    raise AssertionError(f"Shanggu core exceeds its 150 KB budget: {core_bytes}")
page_text = (ROOT / "党項語藏文轉寫方案.html").read_text(encoding="utf-8")
page_text += (ROOT / "converter" / "index.html").read_text(encoding="utf-8")
page_text += (ROOT / "converter" / "converter.js").read_text(encoding="utf-8")

for style, weight in (("Regular", 400), ("Bold", 700)):
    source = asset_root / "shanggu" / f"ShangguSans-{style}.ttf"
    source_chars = characters(source)
    entries = sorted((ROOT / "fonts" / "shanggu-web").glob(f"ShangguSans-{style}-*.woff2"))
    chunk_union: set[int] = set()
    core_chars: set[int] = set()
    for entry in entries:
        chunk_chars = characters(entry)
        overlap = chunk_union & chunk_chars
        if overlap:
            sample = min(overlap)
            raise AssertionError(f"{style} chunks overlap at U+{sample:04X}")
        chunk_union.update(chunk_chars)
        if entry.name.endswith("-core.woff2"):
            core_chars.update(chunk_chars)
    if chunk_union != source_chars:
        missing = source_chars - chunk_union
        extra = chunk_union - source_chars
        raise AssertionError(
            f"{style} chunk union mismatch: missing={len(missing)} extra={len(extra)}"
        )
    required_core = {ord(character) for character in page_text} & source_chars
    if not required_core <= core_chars:
        sample = min(required_core - core_chars)
        raise AssertionError(f"{style} core misses page character U+{sample:04X}")
    print(
        f"ShangguSans-{style}: chunks={len(entries)} union={len(chunk_union)} "
        f"core={len(core_chars)}"
    )

print(
    f"ok - Shanggu web chunks are disjoint and retain the complete cmap; "
    f"core={core_bytes} bytes css={len(chunk_css.encode('utf-8'))} bytes"
)

tangut_full = ROOT / "fonts" / "NotoSerifTangut-Regular.woff2"
tangut_page = ROOT / "fonts" / "NotoSerifTangut-Page.woff2"
scheme_text = (ROOT / "党項語藏文轉寫方案.html").read_text(encoding="utf-8")
full_tangut_chars = characters(tangut_full)
page_tangut_chars = characters(tangut_page)
required_tangut_chars = {
    codepoint
    for codepoint in ({ord(character) for character in scheme_text} & full_tangut_chars)
    if codepoint == 0x16FE0 or 0x17000 <= codepoint <= 0x18DFF
}
if page_tangut_chars != required_tangut_chars:
    raise AssertionError(
        f"Tangut page subset mismatch: missing={len(required_tangut_chars - page_tangut_chars)} "
        f"extra={len(page_tangut_chars - required_tangut_chars)}"
    )
if tangut_page.stat().st_size >= tangut_full.stat().st_size // 4:
    raise AssertionError("Tangut page subset exceeds 25% of the complete font")
print(
    f"ok - Tangut page subset covers {len(page_tangut_chars)} page characters; "
    f"page={tangut_page.stat().st_size} bytes full={tangut_full.stat().st_size} bytes"
)
