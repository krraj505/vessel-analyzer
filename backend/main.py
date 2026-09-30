from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# FIX 1: Brought in the missing ML and Ports routers
from routers import ingestion_router, vessel_router, market_router, ports_router

app = FastAPI(
    title="ARTIFEX API",
    description="Main entry point for microservices routing and vessel filtering",
    version="1.0.0"
)

# CORS is perfectly configured for Vite
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8443",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8443",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX 2: Removed the rogue "/api/v1" prefix and included all 4 microservices
app.include_router(ingestion_router.router, tags=["Ingestion Service"])
app.include_router(vessel_router.router, tags=["Vessel Constraints"])
app.include_router(vessel_router.match_router)
app.include_router(market_router.router)
app.include_router(ports_router.router)

@app.get("/")
def gateway_root():
    return {"message": "ARTIFEX God Machine is Online."}