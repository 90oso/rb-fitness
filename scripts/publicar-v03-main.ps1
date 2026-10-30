param(
  [Parameter(Mandatory=$true)][string]$RepoPath,
  [switch]$SupabaseConfigurado
)
$ErrorActionPreference = 'Stop'
$source = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
$target = (Resolve-Path -LiteralPath $RepoPath -ErrorAction Stop).Path

function Check-Exit([string]$context) {
  if ($LASTEXITCODE -ne 0) { throw "Fallo: $context (exit $LASTEXITCODE)" }
}

if (-not $SupabaseConfigurado) {
  throw 'NO se publico nada. RB 0.3 requiere Supabase (SQL, Auth y variables de Vercel). Cuando este listo, ejecuta nuevamente con -SupabaseConfigurado.'
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git no esta instalado o disponible en PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js/npm no esta instalado o disponible en PATH.' }
if (-not (Test-Path -LiteralPath (Join-Path $target '.git'))) { throw 'La ruta de destino no contiene el repositorio Git.' }

$remote = (& git -C $target remote get-url origin).Trim()
Check-Exit 'verificar remote'
if ($remote -notmatch '^(https://github\.com/90oso/rb-fitness(\.git)?|git@github\.com:90oso/rb-fitness(\.git)?)$') {
  throw "El remote no coincide con 90oso/rb-fitness: $remote"
}
$branch = (& git -C $target branch --show-current).Trim()
Check-Exit 'identificar rama'
if ($branch -ne 'main') { throw "La rama actual es '$branch'. Ejecuta primero git switch main." }
if ((& git -C $target status --porcelain).Length -gt 0) { throw 'Hay cambios locales sin guardar; deja el repositorio limpio antes de actualizar.' }

& git -C $target fetch origin main
Check-Exit 'actualizar origin/main'
& git -C $target pull --ff-only origin main
Check-Exit 'actualizar rama main sin sobrescribir commits'

$files = Get-ChildItem -LiteralPath $source -File -Recurse -Force | Where-Object {
  $_.FullName -notmatch '[\\/](\.git|node_modules|\.next)[\\/]' -and
  $_.Name -ne 'package-lock.json' -and
  $_.Name -ne '.env.local'
}
foreach ($file in $files) {
  $relative = $file.FullName.Substring($source.Length).TrimStart([char]92,[char]47)
  $dest = Join-Path $target $relative
  $dir = Split-Path -Path $dest -Parent
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Copy-Item -LiteralPath $file.FullName -Destination $dest -Force
}

Push-Location $target
try {
  & npm install --no-audit --no-fund
  Check-Exit 'instalar dependencias y actualizar package-lock'
  & npm run test:metrics
  Check-Exit 'pruebas de metricas'
  & npm run test:cycles
  Check-Exit 'pruebas de ciclos'
  & npm run typecheck
  Check-Exit 'TypeScript'
  & npm run build
  Check-Exit 'compilar Next.js'
} finally { Pop-Location }

& git -C $target add -A
Check-Exit 'preparar archivos'
& git -C $target diff --cached --check
Check-Exit 'revisar diff'
& git -C $target diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host 'Sin cambios pendientes para main.' -ForegroundColor Yellow
  exit 0
}
& git -C $target commit -m 'feat: ciclos personalizados y progreso en Supabase'
Check-Exit 'crear commit en main'
& git -C $target push origin main
Check-Exit 'publicar main'
Write-Host 'RB 0.3 publicado directamente a main. Revisa el despliegue en Vercel.' -ForegroundColor Green
