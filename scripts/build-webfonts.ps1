$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputRoot = Join-Path $projectRoot "fonts"
$templateClass = (& kpsewhich nextart_zh.cls).Trim()

if (-not $templateClass) {
    throw "nextart_zh.cls was not found. Install the LaTeX template first."
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python was not found. Install Python, fonttools and brotli first."
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
    $temporaryPath = "$outputPath.tmp.woff2"
    if (Test-Path -LiteralPath $temporaryPath) {
        Remove-Item -LiteralPath $temporaryPath -Force
    }
    & python -m fontTools.ttLib.woff2 compress $fontJob.Source -o $temporaryPath

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate $($fontJob.Output)"
    }
    Move-Item -LiteralPath $temporaryPath -Destination $outputPath -Force
}

$shangguSourceRoot = Join-Path $assetRoot "shanggu"
& python (Join-Path $PSScriptRoot "build-shanggu-webfonts.py") $shangguSourceRoot $projectRoot
if ($LASTEXITCODE -ne 0) {
    throw "Failed to generate Shanggu Sans web subsets"
}

Write-Host "Generated complete WOFF2 webfonts and Shanggu web subsets in $outputRoot"
