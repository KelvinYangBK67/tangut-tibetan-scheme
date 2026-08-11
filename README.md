# 党項語藏文轉寫方案 / Tangut Tibetan Transcription Scheme

## 轉寫方案 / Transcription scheme

本方案爲以[龔勳 GX202411 擬音方案](https://semakosa.github.io/tangut-pronunciation-db/docs/GX202411-zh.html)爲基礎、使用藏文拼寫党項語的娛樂性方案。

This is a recreational scheme for spelling Tangut in Tibetan script, based on [Gong Xun’s GX202411 transcription](https://semakosa.github.io/tangut-pronunciation-db/docs/GX202411-zh.html).

- [閱讀中文網頁版](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.html)／[中文 PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.pdf)
- [Read the English web edition](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88-en.html) / [English PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/Tangut-Tibetan-Transcription-Scheme.pdf)

雖然本方案以 GX 爲基礎，其正字法亦有意反映傳統聲韻地位。GX 不區分 R.92／R.100 與 R.79／R.101，本方案則在 R.100、R.101 前加 `འ-`；相應的 GHC 對立爲 `-jɨr/-jɨɨr` 與 `-jijr/-jiir`。

Although based on GX, the orthography intentionally preserves selected traditional rhyme-table categories. GX merges R.92/R.100 and R.79/R.101; this scheme prefixes `འ-` in R.100 and R.101. The corresponding GHC contrasts are `-jɨr/-jɨɨr` and `-jijr/-jiir`.

- [藏文轉寫與 GHC 中文對照簡表](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/)／[PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E8%88%87GHC%E5%B0%8D%E7%85%A7%E7%B0%A1%E8%A1%A8.pdf)
- [English Tibetan–GHC correspondence chart](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/index-en.html) / [PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/Tibetan-GHC-Correspondence.pdf)

## 互轉工具 / Converter

[使用 GX／勳拼／GHC–藏文互轉工具](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/converter/)

[Open the GX/Xunpin/GHC–Tibetan converter](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/converter/).

GX → 藏文方向亦支援[勳拼](https://github.com/tinbreaker/rime-xunpin)，無須切換模式：末尾有 `¹`、`²` 或 `?` 時按 GX 解析，否則按勳拼解析。勳拼先轉成 canonical GX，再進入同一藏文核心。

The GX-to-Tibetan direction also accepts [Xunpin](https://github.com/tinbreaker/rime-xunpin) without a mode switch: tokens ending in `¹`, `²`, or `?` are GX; all others are parsed strictly as Xunpin. Xunpin is converted to canonical GX before entering the shared Tibetan core.

標準 GX 無法區分 R.100／R.101，因此預設轉成不加 `འ-` 的 R.92／R.79。若要強制帶 `འ-`，請在韻腹前加反斜線，如 `rtś\ər¹`、`rts\er¹`。藏文反向轉寫預設仍輸出標準 GX；勾選 R.100／R.101 選項後，才恢復 `\`。GHC 互轉則直接利用藏文保留的區別。

Standard GX cannot distinguish R.100/R.101, so conversion defaults to unprefixed R.92/R.79. To force `འ-`, place a backslash before the vowel nucleus, as in `rtś\ər¹` or `rts\er¹`. Reverse conversion defaults to standard GX and restores `\` only when the R.100/R.101 option is selected. GHC conversion reads the distinction preserved by the Tibetan spelling directly.

### 標點 / Punctuation

句末標點 `.`、`。`、`?`、`？`、`!`、`！` 轉爲 `༎ `；一般標點如 `,`、`，`、`;`、`；`、`:`、`：` 轉爲 `། `，且標點前不加 `་`。引號會移除，但相鄰有效音節之間仍補 `་`。省略號與缺字方框原樣保留。尚未標調音節後的 `?` 表示聲調存疑；已有聲調後的 `?` 是疑問標點，`\?` 永遠強制爲疑問標點。

Sentence-final `. 。 ? ？ ! ！` becomes `༎ `; general punctuation such as `, ， ; ； : ：` becomes `། `, without an extra `་` before it. Quotation marks are removed, while adjacent valid syllables retain their separating `་`. Ellipses and missing-character boxes are preserved. A `?` after an untoned syllable marks uncertain tone; after an explicit tone it is punctuation, and `\?` always forces punctuation.

### 字形次序 / Shaping order

含 `༹` 的複雜 stack 以 shaping 穩定爲準：先連續寫完下加字母，再寫 `༹`；反向轉換也能辨認舊次序。

For complex stacks containing `༹`, shaping stability determines the canonical order: write all subjoined letters contiguously before `༹`. Reverse conversion also recognizes the older semantic order.
