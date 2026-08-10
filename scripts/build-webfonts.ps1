$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$htmlFiles = @(Get-ChildItem -LiteralPath $projectRoot -Filter "*.html" -File)
$htmlPath = if ($htmlFiles.Count -eq 1) { $htmlFiles[0].FullName } else { $null }
$outputRoot = Join-Path $projectRoot "fonts"
$templateClass = (& kpsewhich nextart_zh.cls).Trim()

if (-not $htmlPath) {
    throw "Expected exactly one HTML file in the project root."
}
if (-not $templateClass) {
    throw "nextart_zh.cls was not found. Install the LaTeX template first."
}
if (-not (Get-Command pyftsubset -ErrorAction SilentlyContinue)) {
    throw "pyftsubset was not found. Install fonttools and brotli first."
}

$templateRoot = Split-Path -Parent $templateClass
$assetRoot = Join-Path $templateRoot "assets\fonts"
$fontJobs = @(
    @{ Source = (& kpsewhich LibertinusSans-Regular.otf).Trim(); Output = "LibertinusSans-Regular.woff2" },
    @{ Source = (& kpsewhich LibertinusSans-Bold.otf).Trim(); Output = "LibertinusSans-Bold.woff2" },
    @{ Source = (& kpsewhich LibertinusSans-Italic.otf).Trim(); Output = "LibertinusSans-Italic.woff2" },
    @{ Source = Join-Path $assetRoot "shanggu\ShangguSans-Regular.ttf"; Output = "ShangguSans-Regular.woff2" },
    @{ Source = Join-Path $assetRoot "shanggu\ShangguSans-Bold.ttf"; Output = "ShangguSans-Bold.woff2" },
    @{ Source = Join-Path $assetRoot "tibetan\NotoSerifTibetan-Regular.ttf"; Output = "NotoSerifTibetan-Regular.woff2" },
    @{ Source = Join-Path $assetRoot "tangut\NotoSerifTangut-Regular.ttf"; Output = "NotoSerifTangut-Regular.woff2" }
)

foreach ($fontJob in $fontJobs) {
    if (-not (Test-Path -LiteralPath $fontJob.Source)) {
        throw "Font not found: $($fontJob.Source)"
    }

    $outputPath = Join-Path $outputRoot $fontJob.Output
    & pyftsubset $fontJob.Source `
        "--text-file=$htmlPath" `
        "--output-file=$outputPath" `
        "--flavor=woff2" `
        "--layout-features=*" `
        "--glyph-names" `
        "--symbol-cmap" `
        "--legacy-cmap" `
        "--notdef-glyph" `
        "--notdef-outline" `
        "--recommended-glyphs"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate $($fontJob.Output)"
    }
}

Write-Host "Generated webfont subsets in $outputRoot"
