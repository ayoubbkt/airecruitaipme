# Chemin du dossier frontend
$frontendPath = ".\frontend\src"


# Fichier de sortie
$outputFile = "frontend.txt"

# Vider le fichier de sortie s'il existe déjà
if (Test-Path $outputFile) { Clear-Content $outputFile }

# Fonction pour parcourir et copier le contenu
function Copy-FileContents {
    param (
        [string]$Path
    )
    $files = Get-ChildItem -Path $Path -Recurse -File
    foreach ($file in $files) {
        # Ignorer les dossiers/fichiers non pertinents
        if ($file.DirectoryName -notmatch "node_modules|dist|public|build|migrations|tests|components|assets|mock" -and
            $file.Extension -notin ".log", ".lock", ".json", ".md",".css") {
            $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
            Add-Content -Path $outputFile -Value "=== Contenu de $relativePath ==="
            $content = Get-Content -Path $file.FullName -Raw
            Add-Content -Path $outputFile -Value $content
            Add-Content -Path $outputFile -Value "=== FIN ==="
            Add-Content -Path $outputFile -Value ""
        }
    }
}

# Vérifier si le dossier frontend existe
if (Test-Path $frontendPath) {
    Write-Output "Extraction du contenu des fichiers du frontend vers $outputFile..."
    Copy-FileContents -Path $frontendPath
    Write-Output "Terminé ! Consultez $outputFile."
} else {
    Write-Output "Le dossier 'frontend' n'a pas été trouvé."
}