# Tangut-to-Tibetan lookup data

`tangut-tibetan.csv` is the runtime lookup table used by the converter. Its
two columns are deliberately limited to `tangut,tibetan`; the browser does not
load GX or GHC data when converting Tangut text.

The table is generated with:

```powershell
python scripts/build-tangut-tibetan.py `
  "path/to/Tangut-rhyme-dictionaries-data/tangut rhyme dictionaries data.csv" `
  "path/to/tangut-data/babelstone_tangut.sqlite" `
  "path/to/tangut-pronunciation-db/20250507.tsv" `
  converter/data/tangut-tibetan.csv
```

Sources and roles:

- [`nkay0/Tangut-rhyme-dictionaries-data`](https://github.com/nkay0/Tangut-rhyme-dictionaries-data): native *Sea of Characters* R.1-R.105 class and tone, plus the native *Homophones* initial class. These fields determine the orthographic category.
- [`saxxie.dev/tangut-data`](https://tangled.org/saxxie.dev/tangut-data): BabelStone/XHZD GHC reading, used only to bootstrap the basic onset analysis when available.
- [`semakosa/tangut-pronunciation-db`](https://github.com/semakosa/tangut-pronunciation-db): GX202411, used only as the preferred temporary onset/medial analysis and for QA. Its surface rhyme and tone do not select the output rhyme class.

Native Class IV is always rendered with this scheme's `ཎ`, irrespective of
the bootstrap reading. Entries without a usable onset source are omitted
rather than guessed. Duplicate native records prefer an attested *Sea of
Characters* record, then *Precious Rhymes of the Sea of Characters*.
