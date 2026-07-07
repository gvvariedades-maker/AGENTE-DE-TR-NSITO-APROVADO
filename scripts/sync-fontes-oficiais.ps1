# Sincroniza fontes oficiais do edital 04/2026 (retificacao 01/2026) para conteudo/
# Uso: powershell -ExecutionPolicy Bypass -File scripts/sync-fontes-oficiais.ps1

$ErrorActionPreference = "Stop"
$proj = Split-Path $PSScriptRoot -Parent
# Resolve pasta conteúdo pelo caminho real no disco (evita mojibake em Windows PowerShell 5)
$fontesMarker = Get-ChildItem -LiteralPath $proj -Recurse -File -Filter "FONTES.md" -ErrorAction SilentlyContinue |
    Where-Object { $_.DirectoryName -match "conte" } |
    Select-Object -First 1
if ($fontesMarker) {
    $base = $fontesMarker.Directory.FullName
}
else {
    $base = Join-Path $proj "conteúdo"
    New-Item -ItemType Directory -Force -Path $base | Out-Null
}
$manifestPath = Join-Path $base "sync-manifest.json"

$dirs = @("edital", "questões reais", "legislação federal", "resoluções CONTRAN", "senatran", "municipal")
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path (Join-Path $base $d) | Out-Null
}

$ua = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
$manifest = [ordered]@{
    syncedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
    ok       = @()
    failed   = @()
    skipped  = @()
}

function Write-Manifest {
    $manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $manifestPath -Encoding UTF8
}

function Invoke-Download {
    param(
        [string]$Url,
        [string]$OutFile,
        [int]$MinBytes = 1024
    )
    if (Test-Path -LiteralPath $OutFile) {
        $existing = (Get-Item -LiteralPath $OutFile).Length
        if ($existing -ge $MinBytes) {
            $manifest.skipped += [ordered]@{ file = $OutFile; reason = "exists"; bytes = $existing }
            Write-Host "SKIP (exists) $([IO.Path]::GetFileName($OutFile))"
            return $true
        }
    }
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 120 -Headers $ua | Out-Null
        $bytes = (Get-Item -LiteralPath $OutFile).Length
        if ($bytes -lt $MinBytes) {
            Remove-Item -LiteralPath $OutFile -Force -ErrorAction SilentlyContinue
            throw "Arquivo muito pequeno ($bytes bytes)"
        }
        $manifest.ok += [ordered]@{ file = $OutFile; url = $Url; bytes = $bytes }
        Write-Host "OK $([IO.Path]::GetFileName($OutFile)) ($bytes bytes)"
        return $true
    }
    catch {
        $manifest.failed += [ordered]@{ file = $OutFile; url = $Url; error = $_.Exception.Message }
        Write-Host "FAIL $([IO.Path]::GetFileName($OutFile))"
        return $false
    }
}

function Invoke-DownloadFirst {
    param(
        [string[]]$Urls,
        [string]$OutFile,
        [int]$MinBytes = 1024
    )
    foreach ($url in $Urls) {
        if (Invoke-Download -Url $url -OutFile $OutFile -MinBytes $MinBytes) { return $true }
    }
    return $false
}

# Copia de pasta externa (se existir)
$ext = Get-ChildItem "d:\" -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "*CAMPINA GRANDE PB 2026*" } |
    Select-Object -First 1

if ($ext) {
    Write-Host "Copiando de: $($ext.FullName)"
    Get-ChildItem -LiteralPath $ext.FullName -File | ForEach-Object {
        $dest = switch -Regex ($_.Name) {
            "Retifica" { Join-Path $base "edital" }
            "^EDITAL" { Join-Path $base "edital" }
            "PORTARIA.*966" { Join-Path $base "senatran" }
            "^RESOLU|^Resolu" { Join-Path $base "resoluções CONTRAN" }
            default { Join-Path $base "questões reais" }
        }
        Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
        $manifest.ok += [ordered]@{ file = (Join-Path $dest $_.Name); source = "local:$($ext.FullName)" }
    }
}

# Edital na raiz do projeto
$editalRaiz = Join-Path $proj "EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf"
if (Test-Path -LiteralPath $editalRaiz) {
    $dest = Join-Path $base "edital\EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf"
    Copy-Item -LiteralPath $editalRaiz -Destination $dest -Force
    $manifest.ok += [ordered]@{ file = $dest; source = "local:project-root" }
}

# Edital e retificacoes (Prefeitura CG)
$editalDir = Join-Path $base "edital"
$editais = @(
    @{
        File = "EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf"
        Urls = @(
            "https://campinagrande.pb.gov.br/wp-content/uploads/2026/05/SEPARATA-DO-SEMANARIO-OFICIAL-19-DE-MAIO-DE-2026.pdf",
            "https://campinagrande.pb.gov.br/wp-content/uploads/2026/05/SEMANARIO-OFICIAL-No-2.987-DE-19-DE-MAIO-DE-2026.pdf"
        )
    },
    @{
        File = "Retificação do conteúdo programático específico de Legislação de Trânsito.pdf"
        Urls = @(
            "https://campinagrande.pb.gov.br/wp-content/uploads/2026/06/SEMANARIO-OFICIAL-No-2.990-01-A-05-DE-JUNHO-DE-2026-1.pdf"
        )
    },
    @{
        File = "Retificação Nº 04-2026 prorrogação inscrições.pdf"
        Urls = @(
            "https://campinagrande.pb.gov.br/wp-content/uploads/2026/06/SEPARATA-DO-SEMANARIO-OFICIAL-22-DE-JUNHO-DE-2026.pdf"
        )
    }
)
foreach ($e in $editais) {
    Invoke-DownloadFirst -Urls $e.Urls -OutFile (Join-Path $editalDir $e.File) -MinBytes 5000 | Out-Null
}

# Leis federais (Planalto)
$leg = Join-Path $base "legislação federal"
$laws = @{
    "lei-9503-ctb.html"                     = "https://www.planalto.gov.br/ccivil_03/leis/l9503.htm"
    "cf-1988.html"                          = "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
    "lei-8112-servidores.html"              = "https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm"
    "lei-8429-improbidade.html"             = "https://www.planalto.gov.br/ccivil_03/leis/l8429.htm"
    "lei-12527-lai.html"                    = "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm"
    "lei-13709-lgpd.html"                   = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
    "lei-9784-processo-administrativo.html" = "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm"
    "lei-14133-licitacoes.html"             = "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm"
}
foreach ($kv in $laws.GetEnumerator()) {
    $outCtb = Join-Path $leg $kv.Key
    $minBytes = if ($kv.Key -eq "lei-9503-ctb.html") { 800000 } else { 5000 }
    if ($kv.Key -eq "lei-9503-ctb.html" -and (Test-Path -LiteralPath $outCtb)) {
        $ctbLen = (Get-Item -LiteralPath $outCtb).Length
        if ($ctbLen -lt $minBytes) {
            Remove-Item -LiteralPath $outCtb -Force
            Write-Host "CTB truncado ($ctbLen bytes) - rebaixando..."
        }
    }
    $ok = Invoke-Download -Url $kv.Value -OutFile $outCtb -MinBytes $minBytes
    if (-not $ok -and $kv.Key -eq "lei-9503-ctb.html") {
        Start-Sleep -Seconds 3
        $ok = Invoke-Download -Url $kv.Value -OutFile $outCtb -MinBytes $minBytes
    }
    if (-not $ok -and $kv.Key -eq "lei-9503-ctb.html") {
        Write-Host "CTB: tentando fallback Node fetch..."
        $nodeScript = @'
const fs = require("fs");
const url = process.env.CTB_URL;
fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
  .then((r) => r.text())
  .then((t) => {
    fs.writeFileSync(process.argv[1], t);
    console.log(t.length);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
'@
        $tmp = [IO.Path]::GetTempFileName() + ".mjs"
        Set-Content -Path $tmp -Value $nodeScript -Encoding UTF8
        try {
            $env:CTB_URL = $kv.Value
            $len = node $tmp $outCtb 2>&1
            if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $outCtb) -and (Get-Item -LiteralPath $outCtb).Length -ge $minBytes) {
                $manifest.ok += [ordered]@{ file = $outCtb; url = $kv.Value; bytes = (Get-Item -LiteralPath $outCtb).Length; via = "node-fetch" }
                Write-Host "OK lei-9503-ctb.html (node fallback)"
            }
        }
        finally {
            Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        }
    }
}

# Lei Organica Campina Grande
$lo = Join-Path $base "municipal\Lei Organica Campina Grande.pdf"
Invoke-Download -Url "https://campinagrande.pb.gov.br/wp-content/uploads/2018/03/LEI_ORGANICA-DO_MUNCIPIO.pdf" -OutFile $lo -MinBytes 5000 | Out-Null

# SENATRAN Portaria 966/2022
$sen = Join-Path $base "senatran\PORTARIA Nº 966, DE 25 DE JULHO DE 2022.pdf"
Invoke-Download -Url "https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2022/Portaria9662022.pdf" -OutFile $sen -MinBytes 5000 | Out-Null

# Resolucoes CONTRAN (Anexo I retificado 01/2026)
$contranBase = "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes"
$resDir = Join-Path $base "resoluções CONTRAN"

$resolucoes = @(
    @{ File = "RESOLUÇÃO CONTRAN Nº 1.013, DE 16 DE OUTUBRO DE 2024.pdf"; Urls = @("$contranBase/Resolucao10132024.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 227, DE 9 DE FEVEREIRO DE 2007.pdf"; Urls = @("$contranBase/cons227.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 996, DE 15 DE JUNHO DE 2023.pdf"; Urls = @("$contranBase/Resolucao9962023.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 940, DE 28 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9402022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 993, DE 15 DE JUNHO DE 2023.pdf"; Urls = @("$contranBase/Resolucao9932023.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 968, DE 20 DE JUNHO DE 2022.pdf"; Urls = @("$contranBase/resolucao9682022.pdf", "$contranBase/Resolucao9682022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 970, DE 24 DE JUNHO DE 2022.pdf"; Urls = @("$contranBase/resolucao9702022.pdf", "$contranBase/Resolucao9702022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 242, DE 22 DE JUNHO DE 2007.pdf"; Urls = @("$contranBase/resolucao_contran_242.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 914, DE 28 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9142022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 955, DE 28 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9552022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 911, DE 28 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9112022.pdf") },
    @{ File = "Resolução - 1020 - 2025.pdf"; Urls = @("$contranBase/Resolucao10202025.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 1.009, DE 24 DE ABRIL DE 2024.pdf"; Urls = @("$contranBase/Resolucao10092024.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 432, DE 23 DE JANEIRO DE 2013.pdf"; Urls = @("$contranBase/resolu-o-uo-432-2013c.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 918, DE 28 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9182022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 985, DE 15 DE DEZEMBRO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9852022.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 991, DE 19 DE ABRIL DE 2023.pdf"; Urls = @("$contranBase/Resolucao9912023.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 1.003, DE 21 DE DEZEMBRO DE 2023.pdf"; Urls = @("$contranBase/Resolucao10032023.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 1.012, DE 14 DE OUTUBRO DE 2024.pdf"; Urls = @("$contranBase/Resolucao10122024.pdf") },
    @{ File = "RESOLUÇÃO CONTRAN Nº 900, DE 9 DE MARÇO DE 2022.pdf"; Urls = @("$contranBase/Resolucao9002022.pdf") }
)

foreach ($r in $resolucoes) {
    Invoke-DownloadFirst -Urls $r.Urls -OutFile (Join-Path $resDir $r.File) -MinBytes 5000 | Out-Null
}

# Res. 36/1998: PDF indisponivel no gov.br; salvar pagina HTML oficial
$res36Html = Join-Path $resDir "RESOLUÇÃO CONTRAN Nº 36, DE 21 DE MAIO DE 1998.html"
if (-not (Test-Path -LiteralPath $res36Html)) {
    try {
        $page = Invoke-WebRequest -Uri "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucao-contran-no-36-de-21-de-maio-de-1998" -UseBasicParsing -TimeoutSec 90 -Headers $ua
        $page.Content | Set-Content -Path $res36Html -Encoding UTF8
        $manifest.ok += [ordered]@{ file = $res36Html; url = "gov.br HTML"; bytes = $page.RawContentLength }
        Write-Host "OK RESOLUCAO CONTRAN 36 (HTML oficial)"
    }
    catch {
        $manifest.failed += [ordered]@{ file = $res36Html; error = $_.Exception.Message }
        Write-Host "FAIL RESOLUCAO CONTRAN 36"
    }
}
else {
    $manifest.skipped += [ordered]@{ file = $res36Html; reason = "exists" }
}

Write-Manifest

$consolidar = Join-Path $proj "scripts\consolidar-conteudo.mjs"
if (Test-Path -LiteralPath $consolidar) {
    Write-Host ""
    Write-Host "Consolidando nomes e duplicatas em conteudo/..."
    node $consolidar
}

$okCount = $manifest.ok.Count
$failCount = $manifest.failed.Count
$skipCount = $manifest.skipped.Count
Write-Host ""
Write-Host "Sincronizacao concluida: $okCount OK, $failCount falhas, $skipCount ignorados"
Write-Host "Manifesto: conteudo/sync-manifest.json"
if ($failCount -gt 0) {
    Write-Host "Verifique conteudo/FONTES.md para pendencias."
    exit 1
}
exit 0
