# 党項語藏文轉寫方案 / Tangut Tibetan Transcription Scheme

## 轉寫方案 / Transcription scheme

本方案爲以[龔勳 GX202411 擬音方案](https://semakosa.github.io/tangut-pronunciation-db/docs/GX202411-zh.html)爲基礎、使用藏文拼寫党項語的娛樂性方案。

This is a recreational scheme for spelling Tangut in Tibetan script, based on [Gong Xun’s GX202411 transcription](https://semakosa.github.io/tangut-pronunciation-db/docs/GX202411-zh.html).

- [閱讀中文網頁版](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.html) / [中文 PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.pdf)
- [Read the English web edition](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88-en.html) / [English PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/Tangut-Tibetan-Transcription-Scheme.pdf)

雖然本方案以 GX 爲基礎，其正字法亦有意反映傳統聲韻地位。四等韻 R.3、R.11、R.20、R.31、R.37、R.47 後加 `ཡ`；GX 不區分的 R.100、R.101 則前加 `འ-`。

Although based on GX, the orthography preserves selected traditional rhyme-table categories. Grade-IV R.3, R.11, R.20, R.31, R.37, and R.47 take postposed `ཡ`; R.100 and R.101, which GX merges with other rhymes, take preposed `འ-`.

- [藏文轉寫與 GHC 中文對照簡表](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/) / [PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E8%88%87GHC%E5%B0%8D%E7%85%A7%E7%B0%A1%E8%A1%A8.pdf)
- [English Tibetan–GHC correspondence chart](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/index-en.html) / [PDF](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/ghc-comparison/Tibetan-GHC-Correspondence.pdf)

## 互轉工具 / Converter

[使用西夏文–藏文轉換器（兼容 GX/勳拼/GHC）](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/converter/)

[Open the Tangut–Tibetan converter (with GX/Xunpin/GHC compatibility modes)](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/converter/).

主入口直接以 `tangut,tibetan` 靜態表把西夏文轉爲藏文；runtime 不依賴 GX/GHC。表內韻類與聲調取自 native《文海》R.1–R.105，《同音》Class IV 統一輸出 `ཎ`。無可靠聲母資料者不作猜測。

若 native R.x 無法唯一確定，但 GX 或 GHC 至少有一個完整可解析擬音，則按普通三等形式生成並加 `†`；GX 優先於 GHC。若擬音本身連聲調亦存疑，結果可同時帶 `?†`。

體系外標記中，`?` 專表示聲調存疑；`†` 表示讀音證據、聲母等其他存疑。GX 的 `vw` 是一、二等韻在 `v` 後的條件變體，藏文只寫一個 `ཝ`，或在 stack 中使用一個下加 `ྭ`，不把該 `w` 另行拼出。

The primary mode converts Tangut characters through a static `tangut,tibetan` table; runtime lookup does not depend on GX/GHC. Rhyme class and tone follow the native *Sea of Characters* R.1–R.105, and native *Homophones* Class IV consistently outputs `ཎ`. Entries without a reliable onset are not guessed.

If native R.x cannot be uniquely determined but GX or GHC supplies at least one complete, parseable reading, the table uses the ordinary Grade-III spelling and appends `†`; GX takes priority over GHC. If tone is independently uncertain, the result may carry both `?†`.

Among non-systemic marks, `?` is reserved for uncertain tone; `†` marks other uncertainty such as incomplete reading or onset evidence. GX `vw` is the conditioned Grade-I/II realization after `v`, so Tibetan writes only one `ཝ`/subjoined `ྭ` rather than spelling that `w` separately.

GX → 藏文方向亦支援[勳拼](https://github.com/tinbreaker/rime-xunpin)，無須切換模式：末尾有 `¹`、`²` 或 `?` 時按 GX 解析，否則按勳拼解析。勳拼先轉成 canonical GX，再進入同一藏文核心。

The GX-to-Tibetan direction also accepts [Xunpin](https://github.com/tinbreaker/rime-xunpin) without a mode switch: tokens ending in `¹`, `²`, or `?` are GX; all others are parsed strictly as Xunpin. Xunpin is converted to canonical GX before entering the shared Tibetan core.

標準 GX/GHC 不區分四等韻。要強制四等，請在整個韻腹前加反斜線，如 `tś\i¹`、`tś\iw¹`；同一標記也用於 R.100/R.101，如 `rtś\ər¹`、`rts\er¹`。GHC 的 `\n` 強制表示 native Class IV 的 `ṇ`。藏文反向轉寫只有勾選合流韻類選項後才恢復 `\`。

Standard GX/GHC does not distinguish Grade IV. To force it, place a backslash before the whole vowel nucleus, as in `tś\i¹` or `tś\iw¹`. The same marker selects R.100/R.101, as in `rtś\ər¹` or `rts\er¹`. In GHC, `\n` forces native Class-IV `ṇ`. Tibetan-to-GX restores `\` only when the merged-rhyme option is selected.

### 標點 / Punctuation

句末標點 `.`、`。`、`?`、`？`、`!`、`！` 轉爲 `༎ `；一般標點如 `,`、`，`、`;`、`；`、`:`、`：` 轉爲 `། `，且標點前不加 `་`。引號會移除，但相鄰有效音節之間仍補 `་`。省略號與缺字方框原樣保留。尚未標調音節後的 `?` 表示聲調存疑；已有聲調後的 `?` 是疑問標點，`\?` 永遠強制爲疑問標點。

Sentence-final `. 。 ? ？ ! ！` becomes `༎ `; general punctuation such as `, ， ; ； : ：` becomes `། `, without an extra `་` before it. Quotation marks are removed, while adjacent valid syllables retain their separating `་`. Ellipses and missing-character boxes are preserved. A `?` after an untoned syllable marks uncertain tone; after an explicit tone it is punctuation, and `\?` always forces punctuation.

### 字形次序 / Shaping order

含 `༹` 的複雜 stack 以 shaping 穩定爲準：先連續寫完下加字母，再寫 `༹`；反向轉換也能辨認舊次序。

For complex stacks containing `༹`, shaping stability determines the canonical order: write all subjoined letters contiguously before `༹`. Reverse conversion also recognizes the older semantic order.
