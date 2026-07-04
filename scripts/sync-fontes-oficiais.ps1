# Sincroniza fontes oficiais do edital 04/2026 para conteúdo/
# Uso: pwsh -File scripts/sync-fontes-oficiais.ps1

$ErrorActionPreference = "Stop"
$proj = Split-Path $PSScriptRoot -Parent
$base = Join-Path $proj "conteúdo"

$dirs = @("edital", "questões reais", "legislação federal", "resoluções CONTRAN", "senatran", "municipal")
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path (Join-Path $base $d) | Out-Null
}

# Pasta externa do usuário (se existir)
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
    }
}

# Edital na raiz do projeto
$editalRaiz = Join-Path $proj "EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf"
if (Test-Path -LiteralPath $editalRaiz) {
    Copy-Item -LiteralPath $editalRaiz -Destination (Join-Path $base "edital") -Force
}

# Leis federais — Planalto (texto consolidado)
$leg = Join-Path $base "legislação federal"
$laws = @{
    "lei-9503-ctb.html" = "https://www.planalto.gov.br/ccivil_03/leis/l9503.htm"
    "cf-1988.html" = "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
    "lei-8112-servidores.html" = "https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm"
    "lei-8429-improbidade.html" = "https://www.planalto.gov.br/ccivil_03/leis/l8429.htm"
    "lei-12527-lai.html" = "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm"
    "lei-13709-lgpd.html" = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
    "lei-9784-processo-administrativo.html" = "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm"
    "lei-14133-licitacoes.html" = "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm"
}
foreach ($kv in $laws.GetEnumerator()) {
    $out = Join-Path $leg $kv.Key
    Invoke-WebRequest -Uri $kv.Value -OutFile $out -UseBasicParsing -TimeoutSec 90
    Write-Host "OK $($kv.Key)"
}

# Resolução 432 — PDF oficial gov.br
$res432 = Join-Path $base "resoluções CONTRAN\RESOLUÇÃO CONTRAN Nº 432, DE 23 DE JANEIRO DE 2013.pdf"
if (-not (Test-Path -LiteralPath $res432)) {
    Invoke-WebRequest `
        -Uri "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolu-o-uo-432-2013c.pdf" `
        -OutFile $res432 -UseBasicParsing -TimeoutSec 90
    Write-Host "OK Resolução 432"
}

# Lei Orgânica Campina Grande
$lo = Join-Path $base "municipal\Lei Organica Campina Grande.pdf"
if (-not (Test-Path -LiteralPath $lo)) {
    Invoke-WebRequest `
        -Uri "https://campinagrande.pb.gov.br/wp-content/uploads/2018/03/LEI_ORGANICA-DO_MUNCIPIO.pdf" `
        -OutFile $lo -UseBasicParsing -TimeoutSec 90
    Write-Host "OK Lei Orgânica CG"
}

Write-Host "`nSincronização concluída. Verifique conteúdo/FONTES.md para pendências."
