# Webfonts

本目錄中的 WOFF2 字體僅保留 `党項語藏文轉寫方案.html` 實際使用的字形，並保留藏文等文字所需的 OpenType 排版功能。

| 字體 | 用途 | 來源與授權 |
|---|---|---|
| Noto Serif Tangut | 西夏文 | [notofonts/tangut](https://github.com/notofonts/tangut)，SIL OFL 1.1 |
| Noto Serif Tibetan | 藏文 | [notofonts/tibetan](https://github.com/notofonts/tibetan)，SIL OFL 1.1 |
| Shanggu Sans | 中文 | LaTeX 模板所附 Shanggu Fonts 1.025，SIL OFL 1.1 |
| Libertinus Sans | 拉丁字母與音標 | [alerque/libertinus](https://github.com/alerque/libertinus)，SIL OFL 1.1 |

各字體的完整授權文字位於同目錄的 `OFL-*.txt`。若 HTML 新增字符，執行 `scripts/build-webfonts.ps1` 重新生成相應子集。
