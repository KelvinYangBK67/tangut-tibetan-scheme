# 党項語藏文轉寫方案

## 建立 PDF 與圖片

雙擊 `scripts/build-images.cmd`，或在 PowerShell 執行：

```powershell
.\scripts\build-images.ps1
```

腳本會執行兩遍 XeLaTeX，將輔助檔集中到 `tex/build/`，在根目錄建立
`党項語藏文轉寫方案.pdf`，並在 `image/` 建立逐頁 600 dpi PNG。

如需不同解析度，可傳入 `-Dpi`：

```powershell
.\scripts\build-images.ps1 -Dpi 300
```

原始 LaTeX 文件位於 `tex/main.tex`。
