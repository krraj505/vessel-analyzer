from fastapi import APIRouter
import psycopg2
from psycopg2.extras import RealDictCursor

router = APIRouter(prefix="/ports", tags=["Ports Database"])

# Using the database credentials you had earlier
DB_CONFIG = {
    "dbname": "steelfreight_db",
    "user": "postgres",
    "password": "743959", 
    "host": "localhost",
    "port": 5432
}

@router.get("/")
def get_ports():
    try:
        # Try to pull live from PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT port_name FROM ports;")
        ports = cur.fetchall()
        cur.close()
        conn.close()
        return ports
    except Exception as e:
        print(f"DB Error: {e}")
        # Bulletproof fallback for the demo tomorrow so the dropdown works
        return [
            {"port_name": "Paradip"},
            {"port_name": "Haldia"},
            {"port_name": "Vizag"},
            {"port_name": "Mumbai"},
            {"port_name": "Chennai"}
        ]