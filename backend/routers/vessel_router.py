import psycopg2
import psycopg2.extras
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/filter-vessels", tags=["Vessels"])
match_router = APIRouter(tags=["Vessels"])

# Database connection configuration
DB_CONFIG = {
    "dbname": "steelfreight_db",
    "user": "postgres",
    "password": "743959",
    "host": "localhost",
    "port": "5432"
}

class VesselFilterCriteria(BaseModel):
    target_port_name: Optional[str] = "Haldia"
    max_draft: Optional[float] = None
    min_length: Optional[float] = None
    vessel_type: Optional[str] = None

class VesselResponseItem(BaseModel):
    vessel_id: str
    name: str
    vessel_type: str
    draft: float
    length: float
    status: Optional[str] = "Active"

def fetch_port_and_vessels_from_db(port_name: str):
    """Connects to PostgreSQL and fetches port constraints and vessel records."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # 1. Fetch target port data
        cursor.execute("SELECT * FROM ports WHERE port_name = %s;", (port_name,))
        live_port = cursor.fetchone()
        
        if not live_port:
            cursor.close()
            conn.close()
            return None, []

        # 2. Fetch all vessel records
        cursor.execute("SELECT * FROM vessels;")
        live_vessels = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return live_port, live_vessels

    except Exception as e:
        print(f"❌ Database connection or query error: {e}")
        return None, []

def match_vessels_against_port(live_port, live_vessels):
    compatible_vessels = []
    for vessel in live_vessels:
        row = dict(vessel)
        draft_ok = row.get("draft", 0) <= live_port.get("max_draft", float("inf"))
        loa_ok = row.get("loa", 0) <= live_port.get("max_loa", float("inf"))
        beam_ok = row.get("beam", 0) <= live_port.get("max_beam", float("inf"))
        if draft_ok and loa_ok and beam_ok:
            compatible_vessels.append(row)
    return compatible_vessels

@match_router.get("/api/match-vessels/{selected_port}")
def match_vessels(selected_port: str):
    live_port, live_vessels = fetch_port_and_vessels_from_db(selected_port)
    if live_port is None:
        return []
    return match_vessels_against_port(live_port, live_vessels)

@router.post("/", response_model=List[dict])
def filter_vessels(criteria: VesselFilterCriteria):
    """
    Triggers the PostgreSQL-backed constraint engine and returns filtered ships in clean JSON format.
    """
    try:
        live_port, live_vessels = fetch_port_and_vessels_from_db(criteria.target_port_name)
        
        if live_port is None:
            raise HTTPException(
                status_code=404, 
                detail=f"Could not find port '{criteria.target_port_name}' in the database."
            )
            
        if not live_vessels:
            raise HTTPException(
                status_code=404, 
                detail="The vessels table is empty or could not be retrieved."
            )

        # Run constraint engine compatibility logic (Draft, LOA, Beam)
        compatible_vessels = match_vessels_against_port(live_port, live_vessels)

        if criteria.max_draft is not None:
            compatible_vessels = [v for v in compatible_vessels if v.get('draft', 0) <= criteria.max_draft]
        if criteria.min_length is not None:
            compatible_vessels = [v for v in compatible_vessels if v.get('length', 0) >= criteria.min_length]
        if criteria.vessel_type is not None:
            compatible_vessels = [
                v for v in compatible_vessels
                if v.get('vessel_type', '').lower() == criteria.vessel_type.lower()
            ]

        return compatible_vessels

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Constraint engine execution error: {str(e)}"
        )