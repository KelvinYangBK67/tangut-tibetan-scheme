[CmdletBinding()]
param(
    [ValidateRange(72, 2400)]
    [int]$Dpi = 600
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$documentTitle = -join @(
    [char]0x515A, [char]0x9805, [char]0x8A9E,
    [char]0x85CF, [char]0x6587, [char]0x8F49,
    [char]0x5BEB, [char]0x65B9, [char]0x6848
)
$texDirectory = Join-Path $projectRoot 'tex'
$buildDirectory = Join-Path $texDirectory 'build'
$sourcePath = Join-Path $texDirectory 'main.tex'
$builtPdfPath = Join-Path $buildDirectory "$documentTitle.pdf"
$pdfPath = Join-Path $projectRoot "$documentTitle.pdf"
$imageDirectory = Join-Path $projectRoot 'image'
$imagePrefix = Join-Path $imageDirectory $documentTitle

foreach ($commandName in 'xelatex', 'pdftoppm') {
    if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $commandName"
    }
}

if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "LaTeX source not found: $sourcePath"
}

Push-Location $projectRoot
try {
    New-Item -ItemType Directory -Path $buildDirectory -Force | Out-Null

    Write-Host "Building $documentTitle.pdf ..."
    for ($pass = 1; $pass -le 2; $pass++) {
        & xelatex -interaction=nonstopmode -halt-on-error "-jobname=$documentTitle" "-output-directory=$buildDirectory" $sourcePath
        if ($LASTEXITCODE -ne 0) {
            throw "LaTeX build pass $pass failed with exit code $LASTEXITCODE."
        }
    }

    Copy-Item -LiteralPath $builtPdfPath -Destination $pdfPath -Force

    New-Item -ItemType Directory -Path $imageDirectory -Force | Out-Null

    Get-ChildItem -LiteralPath $imageDirectory -Filter "$documentTitle-*.png" -File |
        Remove-Item -Force

    Write-Host "Rendering PNG files at $Dpi dpi ..."
    & pdftoppm -png -r $Dpi $pdfPath $imagePrefix
    if ($LASTEXITCODE -ne 0) {
        throw "PNG conversion failed with exit code $LASTEXITCODE."
    }

    $pageImages = @(Get-ChildItem -LiteralPath $imageDirectory -Filter "$documentTitle-*.png" -File)
    if ($pageImages.Count -eq 0) {
        throw 'Conversion completed without producing PNG files.'
    }

    Write-Host "Done: created $($pageImages.Count) PNG files at $Dpi dpi in image." -ForegroundColor Green
}
finally {
    Pop-Location
}
