from fastapi import APIRouter

router = APIRouter(prefix="/market", tags=["Market ML Forecast"])

@router.get("/forecast")
def get_market_forecast():
    return [
        {"date": "2025-12-01", "forecast": 65.20, "lower": 51.10, "upper": 79.20},
        {"date": "2025-12-02", "forecast": 64.80, "lower": 50.50, "upper": 78.00},
        {"date": "2025-12-03", "forecast": 63.50, "lower": 49.10, "upper": 77.50},
        {"date": "2025-12-04", "forecast": 62.10, "lower": 48.20, "upper": 76.00},
        {"date": "2025-12-05", "forecast": 61.40, "lower": 47.00, "upper": 75.50},
        {"date": "2025-12-06", "forecast": 60.80, "lower": 46.10, "upper": 74.20},
        {"date": "2025-12-07", "forecast": 60.20, "lower": 45.50, "upper": 73.10},
        {"date": "2025-12-08", "forecast": 59.90, "lower": 45.00, "upper": 72.50},
        {"date": "2025-12-09", "forecast": 60.50, "lower": 45.80, "upper": 73.40},
        {"date": "2025-12-10", "forecast": 61.20, "lower": 46.10, "upper": 74.90},
        {"date": "2025-12-11", "forecast": 61.80, "lower": 46.50, "upper": 75.80},
        {"date": "2025-12-12", "forecast": 61.50, "lower": 46.20, "upper": 75.10},
        {"date": "2025-12-13", "forecast": 60.90, "lower": 45.80, "upper": 74.70},
        {"date": "2025-12-14", "forecast": 60.40, "lower": 45.40, "upper": 74.30},
        {"date": "2025-12-15", "forecast": 61.10, "lower": 46.60, "upper": 75.00},
        {"date": "2025-12-16", "forecast": 62.30, "lower": 47.10, "upper": 76.62},
        {"date": "2025-12-17", "forecast": 63.40, "lower": 48.00, "upper": 77.10},
        {"date": "2025-12-18", "forecast": 64.80, "lower": 49.20, "upper": 78.80},
        {"date": "2025-12-19", "forecast": 66.20, "lower": 51.10, "upper": 80.40},
        {"date": "2025-12-20", "forecast": 67.10, "lower": 52.50, "upper": 81.90},
        {"date": "2025-12-21", "forecast": 67.80, "lower": 53.30, "upper": 82.20},
        {"date": "2025-12-22", "forecast": 68.50, "lower": 54.80, "upper": 83.90},
        {"date": "2025-12-23", "forecast": 69.10, "lower": 55.20, "upper": 84.10},
        {"date": "2025-12-24", "forecast": 69.80, "lower": 55.60, "upper": 84.40},
        {"date": "2025-12-25", "forecast": 70.40, "lower": 56.90, "upper": 85.10},
        {"date": "2025-12-26", "forecast": 71.20, "lower": 57.00, "upper": 86.80},
        {"date": "2025-12-27", "forecast": 72.10, "lower": 58.10, "upper": 87.20},
        {"date": "2025-12-28", "forecast": 72.90, "lower": 58.80, "upper": 88.50},
        {"date": "2025-12-29", "forecast": 73.60, "lower": 59.90, "upper": 89.30},
        {"date": "2025-12-30", "forecast": 74.20, "lower": 60.70, "upper": 90.10}
    ]