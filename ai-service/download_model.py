import subprocess
import sys

def main():
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "https://github.com/explosion/spacy-models/releases/download/fr_core_news_md-3.5.0/fr_core_news_md-3.5.0-py3-none-any.whl"
        ])
        
        print("Modèle spaCy téléchargé avec succès!")
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors du téléchargement du modèle spaCy: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()