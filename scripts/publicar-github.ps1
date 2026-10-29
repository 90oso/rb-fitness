# Publica RB en un repositorio privado propio, sin modificar repositorios existentes.
# Requiere Git y GitHub CLI (gh) autenticado con: gh auth login
param([string]$Repository = '90oso/rb-fitness')
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Falta Git. Instálalo desde https://git-scm.com/' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Falta GitHub CLI. Instálalo desde https://cli.github.com/' }
gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Autentica GitHub CLI con gh auth login.' }
if (-not (Test-Path '.git')) { git init }
git branch -M main
git add .
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Hay errores de formato en los archivos preparados.' }
$pending = git diff --cached --name-only
if ($pending) { git commit -m 'feat: RB Fitness MVP con seguimiento y progreso'; if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el commit; revisa git config user.name y user.email.' } }
$found = gh repo view $Repository --json nameWithOwner 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create $Repository --private --source . --remote origin --push
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear/publicar el repositorio.' }
} else {
  $origin = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0) { git remote add origin "https://github.com/$Repository.git" }
  elseif ($origin -notmatch [regex]::Escape($Repository)) { throw "El remoto origin apunta a '$origin', no a '$Repository'. No se modificó." }
  git push -u origin main
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo enviar la rama main.' }
}
Write-Host "Código publicado: https://github.com/$Repository" -ForegroundColor Green
Write-Host 'Para desplegar: en vercel.com/new importa el repositorio y elige Next.js.'
