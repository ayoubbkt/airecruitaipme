# Chemin du dossier backend
$backendPath = ".\backend\src"

# Fichier de sortie
$outputFile = "backend.txt"

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

# Vérifier si le dossier backend existe
if (Test-Path $backendPath) {
    Write-Output "Extraction du contenu des fichiers du backend vers $outputFile..."
    Copy-FileContents -Path $backendPath
    Write-Output "Terminé ! Consultez $outputFile."
} else {
    Write-Output "Le dossier 'backend' n'a pas été trouvé."
}