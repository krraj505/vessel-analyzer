from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

class IngestPayload(BaseModel):
    source_id: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, str]] = None

@router.post("/")
def ingest_data(payload: IngestPayload):
    try:
        return {
            "status": "success",
            "message": "Data received and queued for processing.",
            "source_id": payload.source_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))