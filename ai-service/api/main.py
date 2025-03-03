from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import uuid
import json
import redis.asyncio as redis
from pydantic import BaseModel
import logging

app = FastAPI()

# Configuration de Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CVAnalysisResponse(BaseModel):
    skills: List[str] = []
    experience: str = ""
    score: int = 0

@app.post("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/analyze-cv-batch")
async def analyze_cv_batch(
    files: List[UploadFile] = File(...), 
    job_description: str = Form(...)
):
    """
    Analyse par lot de CV avec suivi de progression
    """
    try:
        analysis_id = str(uuid.uuid4())
        total_files = len(files)
        
        # Stocker les métadonnées dans Redis
        await redis_client.setex(
            f"analysis:{analysis_id}:metadata",
            3600,
            json.dumps({
                "total": total_files,
                "processed": 0,
                "status": "processing",
                "job_description": job_description
            })
        )
        
        # Traitement asynchrone
        for index, file in enumerate(files):
            content = await file.read()
            
            # Extraire les informations du CV
            extracted_info = {"skills": ["Java", "Spring"], "experience": "5 years"} # À compléter
            
            # Analyse simulée
            analysis_result = CVAnalysisResponse(
                skills=extracted_info["skills"],
                experience=extracted_info["experience"],
                score=85
            )
            
            # Stocker les résultats
            await redis_client.setex(
                f"analysis:{analysis_id}:{index}",
                3600,
                json.dumps(analysis_result.dict())
            )
            
            # Mettre à jour la progression
            await redis_client.incr(f"analysis:{analysis_id}:processed")
        
        # Marquer comme terminé
        await redis_client.set(
            f"analysis:{analysis_id}:metadata:status",
            "completed"
        )
        
        return JSONResponse({
            "analysis_id": analysis_id,
            "message": "Batch analysis started"
        })
    
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(500, "Erreur d'analyse des CV")

@app.get("/api/analysis/{analysis_id}/progress")
async def get_analysis_progress(analysis_id: str):
    """
    Récupération de la progression de l'analyse
    """
    try:
        metadata = await redis_client.get(f"analysis:{analysis_id}:metadata")
        if not metadata:
            raise HTTPException(404, "Analyse non trouvée")
            
        data = json.loads(metadata)
        return {
            "progress": data["processed"] / data["total"] * 100,
            "status": data["status"]
        }
    except Exception as e:
        logger.error(f"Progress check error: {str(e)}")
        raise HTTPException(500, "Erreur de récupération de la progression")