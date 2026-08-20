# Tangut-to-Tibetan lookup data

`tangut-tibetan.csv` is the runtime lookup table used by the converter. Its
two columns are deliberately limited to `tangut,tibetan`; the browser does not
load GX or GHC data when converting Tangut text.

The table is generated with:

```powershell
python scripts/build-tangut-tibetan.py `
  "local-data/upstream/Tangut-rhyme-dictionaries-data/tangut rhyme dictionaries data.csv" `
  "local-data/upstream/tangut-data/babelstone_tangut.sqlite" `
  "local-data/upstream/tangut-pronunciation-db/20250507.tsv" `
  converter/data/tangut-tibetan.csv `
  --unicode-data "local-data/upstream/unicode-17.0.0/UnicodeData.txt" `
  --audit "local-data/reports/tangut-lookup-audit.csv" `
  --unresolved "local-data/reports/tangut-lookup-unresolved.csv"
```

Sources and roles:

- [`nkay0/Tangut-rhyme-dictionaries-data`](https://github.com/nkay0/Tangut-rhyme-dictionaries-data): native *Sea of Characters* R.1-R.105 class and tone, plus the native *Homophones* initial class. These fields determine the orthographic category.
- [`saxxie.dev/tangut-data`](https://tangled.org/saxxie.dev/tangut-data): BabelStone/XHZD GHC reading, used only to bootstrap the basic onset analysis when available.
- [`semakosa/tangut-pronunciation-db`](https://github.com/semakosa/tangut-pronunciation-db): GX202411, used only as the preferred temporary onset/medial analysis and for QA. Its surface rhyme and tone do not select the output rhyme class.

Fourth-class initials in the native *Homophones* are always rendered with this scheme's `ཎ`, irrespective of
the bootstrap reading. Grade IV is selected only by native R.3, R.11, R.20,
R.31, R.37, and R.47, never by GX or GHC surface spelling.

When direct native rhyme or tone data are absent, the generator accepts only a
unique result supported by native canonical-form/variant relations, a fanqie
lower character, or a GHC rhyme identifier that maps uniquely back to the
native tone/rhyme inventory. Missing direct GX/GHC onset data may likewise use
a canonical form, a consistent *Homophones* subgroup, or a fanqie upper
character. Forms relying on auxiliary GHC rhyme classification or fanqie
inference end in `†`; `?` is reserved for uncertain tone. A unique
canonical-form relation or consistent
*Homophones* subgroup is accepted without the uncertainty mark. Conflicting
or unsupported evidence remains in the local unresolved report rather than
being guessed.

If native R.x cannot be uniquely recovered but the character has a direct GX
or GHC reading, the generator retains that reading using its ordinary
Grade-III spelling. It appends `†` only when a native distinction could affect
that spelling or the direct reading is itself uncertain; for example, an
o-rhyme receives no grade uncertainty because the inventory has no Grade-IV
o-rhyme. GX takes priority over GHC. An independently
uncertain tone remains `?`, so an entry may end in `?†` when both uncertainties
apply.

GX forms of the shape `rVr` are parsed with an actual `r` onset restricted to
retroflex rhymes, rather than as a zero onset plus an independent retroflex
marker. This does not alter the zero-onset placeholders in the published rhyme
inventory.
Duplicate direct records retain the established *Sea of Characters*, then
*Precious Rhymes of the Sea of Characters*, source priority.

Characters retained in the unresolved report are committed to the runtime table
as `☐`; the converter preserves their syllable position and reports them as
unresolved.

`local-data/` is deliberately ignored by Git: it contains third-party database
checkouts and reproducible audit reports, not project source. The committed
CSV remains the only runtime dependency.
