# 党項語藏文轉寫方案

## 轉寫方案

本方案爲以[龔勳 GX202411 擬音方案](https://semakosa.github.io/tangut-pronunciation-db/docs/GX202411-zh.html)爲基礎的党項語藏文轉寫方案，純屬娛樂。

[閱讀網頁版](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/%E5%85%9A%E9%A0%85%E8%AA%9E%E8%97%8F%E6%96%87%E8%BD%89%E5%AF%AB%E6%96%B9%E6%A1%88.html)

## 互轉工具

[使用 GX／勳拼–藏文互轉工具](https://kelvinyangbk67.github.io/tangut-tibetan-scheme/converter/)

互轉工具的 GX → 藏文方向亦支援[勳拼](https://github.com/tinbreaker/rime-xunpin)輸入，無須切換模式：末尾有 `¹`、`²` 或 `?` 時按 GX 解析，否則按勳拼解析（無標記爲平聲，末尾 `x` 爲上聲），並先轉成 canonical GX 再進入同一套藏文轉換核心。

### 標點

- 句末標點 `.`、`。`、`?`、`？`、`!`、`！` 轉爲 `༎ `；一般標點如 `,`、`，`、`;`、`；`、`:`、`：` 轉爲 `། `。標點前不加 `་`。
- 引號 `" “ ” ' ‘ ’ 「 」 『 』` 會移除；若引號兩側都是成功轉換的音節，兩者之間仍補正常的 `་`。
- 省略號 `…`、`……`、`...` 及表示缺字或殘缺的方框符號原樣保留。
- `?` 緊接在尚未標調的音節後時是聲調存疑標記；音節已有 `¹`、`²` 或 `?` 時，下一個 `?` 才是疑問標點。因此 `foo??` 的第一個 `?` 表示聲調存疑，第二個表示疑問。輸入 `\?` 可強制得到疑問標點 `༎ `。

例如，標點層面的 `bar: "baz?"` 解析爲 `bar| baz||`，相應藏文標點效果爲 `bar། baz༎`。
