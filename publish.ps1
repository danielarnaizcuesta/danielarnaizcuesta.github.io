$ErrorActionPreference = "Stop"

$Repo = "danielarnaizcuesta/danielarnaizcuesta.github.io"
$Remote = "https://github.com/$Repo.git"
$GhCandidates = @(
  "gh",
  "C:\Program Files\GitHub CLI\gh.exe",
  "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
)

$Gh = $null
foreach ($Candidate in $GhCandidates) {
  $Command = Get-Command $Candidate -ErrorAction SilentlyContinue
  if ($Command) {
    $Gh = $Command.Source
    break
  }
}

if (-not $Gh) {
  throw "GitHub CLI no esta disponible. Instala GitHub CLI o abre una terminal nueva si se acaba de instalar."
}

git status --short | Out-Host

& $Gh auth status
if ($LASTEXITCODE -ne 0) {
  & $Gh auth login --web --git-protocol https
}

& $Gh repo view $Repo *> $null
if ($LASTEXITCODE -ne 0) {
  & $Gh repo create $Repo --public --source . --remote origin --push
} else {
  git remote set-url origin $Remote
  git push -u origin main
}

Write-Host ""
Write-Host "Web publicada o subida al repositorio:"
Write-Host "https://github.com/$Repo"
Write-Host "URL prevista de GitHub Pages:"
Write-Host "https://danielarnaizcuesta.github.io/"
