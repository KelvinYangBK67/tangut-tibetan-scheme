# Webfonts

本目錄根層的 WOFF2 字體爲完整字體，不作字符子集化，並保留藏文等文字所需的全部 OpenType 排版功能。因此網頁新增字符時無須重新補字。

| 字體 | 用途 | 來源與授權 |
|---|---|---|
| Noto Serif Tangut | 西夏文 | [notofonts/tangut](https://github.com/notofonts/tangut)，SIL OFL 1.1 |
| Noto Serif Tibetan | 藏文 | [notofonts/tibetan](https://github.com/notofonts/tibetan)，SIL OFL 1.1 |
| Shanggu Sans | 中文 | LaTeX 模板所附 Shanggu Fonts 1.025，SIL OFL 1.1 |
| Libertinus Sans | 拉丁字母與音標 | [alerque/libertinus](https://github.com/alerque/libertinus)，SIL OFL 1.1 |

`shanggu-web/` 是由完整 Shanggu Sans 自動生成的 Web 專用 core 與 Unicode chunks；`shanggu-web.css` 以 `unicode-range` 讓瀏覽器只按頁面實際出現的字符下載所需 chunk，不作全量背景預熱。所有 chunks 的 cmap 聯集與完整字體完全一致。

`NotoSerifTangut-Page.woff2` 則由完整的 `NotoSerifTangut-Regular.woff2` 自動抽取方案網頁實際使用的西夏字，供首屏預載；完整字體仍作爲子集外字符的 fallback。

各字體的完整授權文字位於同目錄的 `OFL-*.txt`。執行 `scripts/build-webfonts.ps1` 可由本機字體來源重新生成完整 WOFF2、Shanggu Web chunks 與 Tangut 頁面子集；生成過程需要 Python、fonttools 與 brotli。
