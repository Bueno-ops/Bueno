# Servidor local do Rotas Inteligentes
# Uso: clique duas vezes em "abrir-app.bat" ou rode:
#   powershell -NoProfile -ExecutionPolicy Bypass -File ".\servidor-local.ps1"
# Serve a pasta do projeto em http://localhost:8099 (necessario para o app
# funcionar como PWA: service worker, instalacao e GPS so funcionam em http/https).

param(
    [int]$Porta = 8099,
    [switch]$SemNavegador
)

$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path

$mimes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".txt"  = "text/plain; charset=utf-8"
    ".md"   = "text/markdown; charset=utf-8"
}

function Abrir-Porta([int]$p) {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$p/")
    $listener.Prefixes.Add("http://127.0.0.1:$p/")
    $listener.Start()
    return $listener
}

$listener = $null
for ($p = $Porta; $p -lt ($Porta + 10); $p++) {
    try { $listener = Abrir-Porta $p; $Porta = $p; break } catch { }
}
if (-not $listener) { throw "Nao foi possivel abrir uma porta entre $Porta e $($Porta + 9)." }

$url = "http://localhost:$Porta/app.html"
Write-Host ""
Write-Host "  Rotas Inteligentes - servidor local" -ForegroundColor Cyan
Write-Host "  Pasta: $Raiz"
Write-Host "  Abra:  $url" -ForegroundColor Green
Write-Host "  (feche esta janela ou aperte Ctrl+C para parar)" -ForegroundColor DarkGray
Write-Host ""

if (-not $SemNavegador) { Start-Process $url }

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        try {
            $req = $ctx.Request
            $res = $ctx.Response

            $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart("/")
            if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

            $caminho = Join-Path $Raiz $rel
            $completo = [System.IO.Path]::GetFullPath($caminho)

            if (-not $completo.StartsWith([System.IO.Path]::GetFullPath($Raiz), [System.StringComparison]::OrdinalIgnoreCase)) {
                $res.StatusCode = 403
                $res.Close()
                continue
            }

            if (Test-Path $completo -PathType Container) {
                $completo = Join-Path $completo "index.html"
            }

            if (Test-Path $completo -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($completo).ToLowerInvariant()
                $tipo = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($completo)

                $res.ContentType = $tipo
                $res.ContentLength64 = $bytes.Length
                $res.Headers["Cache-Control"] = "no-cache"
                $res.Headers["Service-Worker-Allowed"] = "/"
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
                $html = [System.Text.Encoding]::UTF8.GetBytes("<h1>404</h1><p>Nao encontrado: $rel</p><p><a href=""app.html"">Abrir o app</a></p>")
                $res.ContentType = "text/html; charset=utf-8"
                $res.ContentLength64 = $html.Length
                $res.OutputStream.Write($html, 0, $html.Length)
            }
        } catch {
            try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch { }
        } finally {
            try { $ctx.Response.Close() } catch { }
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
