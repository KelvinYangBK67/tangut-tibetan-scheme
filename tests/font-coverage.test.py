from pathlib import Path
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
