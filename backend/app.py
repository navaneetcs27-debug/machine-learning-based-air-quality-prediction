"""
AeroAI - Indian CPCB Machine Learning Air Quality Prediction Engine
FastAPI Backend Application
Serves CPCB NAQI model inference, New Delhi CAAQM station telemetry,
Indian cities registry, counterfactual simulation, and academic Phase 2 evaluation metadata.
"""

import os
import json
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.aqi_calculator import calculate_sub_index, get_aqi_category_info, analyze_pollutants
from data.indian_cities_data import INDIAN_CITIES_REGISTRY

# Initialize FastAPI App
app = FastAPI(
    title="AeroAI - CPCB Air Quality ML Engine",
    description="CPCB NAQI Atmospheric Machine Learning Engine calibrated for New Delhi and Indian Megacities",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

LOADED_MODELS = {}
LOADED_SCALER = None
MODEL_METADATA = {}

def get_models():
    global LOADED_MODELS, LOADED_SCALER, MODEL_METADATA
    # Reload models on demand if empty
    if not LOADED_MODELS:
        model_names = ["random_forest", "gradient_boosting", "decision_tree", "linear_regression"]
        for name in model_names:
            path = os.path.join(MODELS_DIR, f"{name}.joblib")
            if os.path.exists(path):
                LOADED_MODELS[name] = joblib.load(path)
        
        scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
        if os.path.exists(scaler_path):
            LOADED_SCALER = joblib.load(scaler_path)
            
        metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                MODEL_METADATA = json.load(f)
                
    return LOADED_MODELS, LOADED_SCALER, MODEL_METADATA

def reload_models():
    global LOADED_MODELS
    LOADED_MODELS = {}
    return get_models()


class FeaturesInput(BaseModel):
    pm25: float = Field(..., ge=0.0, le=600.0, description="PM2.5 fine particulates (ug/m3)")
    pm10: float = Field(..., ge=0.0, le=1000.0, description="PM10 coarse particulates (ug/m3)")
    no2: float = Field(..., ge=0.0, le=500.0, description="Nitrogen dioxide (ug/m3)")
    so2: float = Field(..., ge=0.0, le=500.0, description="Sulfur dioxide (ug/m3)")
    co: float = Field(..., ge=0.0, le=50.0, description="Carbon monoxide (mg/m3)")
    o3: float = Field(..., ge=0.0, le=500.0, description="Ground-level ozone (ug/m3)")
    temperature: float = Field(..., ge=-15.0, le=55.0, description="Ambient temperature (°C)")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity (%)")
    wind_speed: float = Field(..., ge=0.0, le=100.0, description="Wind speed (km/h)")

class PredictionRequest(BaseModel):
    model_name: Optional[str] = "random_forest"
    features: FeaturesInput

class SimulationRequest(BaseModel):
    base_features: FeaturesInput
    traffic_reduction_pct: float = Field(0.0, ge=-100.0, le=100.0)
    industrial_reduction_pct: float = Field(0.0, ge=-100.0, le=100.0)
    wind_speed_change_pct: float = Field(0.0, ge=-100.0, le=200.0)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "system": "AeroAI CPCB National Air Quality Prediction Engine",
        "standard": "CPCB NAQI (India)",
        "phase": "Phase 2 Evaluation Ready (Oct 2026)"
    }


@app.get("/api/models/info")
def get_model_info():
    models, scaler, metadata = get_models()
    if not metadata:
        raise HTTPException(status_code=503, detail="Models have not finished training yet.")
    return metadata


@app.get("/api/indian-cities")
def get_indian_cities():
    """Returns registry of authentic Indian cities and Delhi CAAQM monitoring stations."""
    return INDIAN_CITIES_REGISTRY


@app.get("/api/delhi-stations")
def get_delhi_stations():
    """Returns focused subset of New Delhi CAAQM monitoring stations."""
    delhi_stations = {k: v for k, v in INDIAN_CITIES_REGISTRY.items() if v["city"] == "New Delhi"}
    return delhi_stations


@app.post("/api/predict")
def predict_aqi(req: PredictionRequest):
    models, scaler, metadata = get_models()
    if not models:
        # Try reloading
        models, scaler, metadata = reload_models()
        if not models:
            raise HTTPException(status_code=503, detail="Models are unavailable.")
        
    f = req.features
    FEATURE_COLS = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity', 'wind_speed']
    raw_feature_df = pd.DataFrame([[
        f.pm25, f.pm10, f.no2, f.so2, f.co, f.o3, f.temperature, f.humidity, f.wind_speed
    ]], columns=FEATURE_COLS)
    
    predictions = {}
    
    # 1. Random Forest
    if "random_forest" in models:
        rf_val = float(models["random_forest"].predict(raw_feature_df)[0])
        predictions["random_forest"] = round(np.clip(rf_val, 0.0, 500.0), 1)
        
    # 2. Gradient Boosting
    if "gradient_boosting" in models:
        gb_val = float(models["gradient_boosting"].predict(raw_feature_df)[0])
        predictions["gradient_boosting"] = round(np.clip(gb_val, 0.0, 500.0), 1)
        
    # 3. Decision Tree
    if "decision_tree" in models:
        dt_val = float(models["decision_tree"].predict(raw_feature_df)[0])
        predictions["decision_tree"] = round(np.clip(dt_val, 0.0, 500.0), 1)
        
    # 4. Linear Regression
    if "linear_regression" in models and scaler is not None:
        scaled_vec = scaler.transform(raw_feature_df)
        lr_val = float(models["linear_regression"].predict(scaled_vec)[0])
        predictions["linear_regression"] = round(np.clip(lr_val, 0.0, 500.0), 1)
        
    # Ensemble Average
    if "random_forest" in predictions and "gradient_boosting" in predictions:
        ensemble_val = round((predictions["random_forest"] + predictions["gradient_boosting"]) / 2.0, 1)
        predictions["ensemble"] = ensemble_val
    else:
        predictions["ensemble"] = list(predictions.values())[0]
        
    chosen_key = req.model_name if req.model_name in predictions else "random_forest"
    primary_aqi = predictions.get(chosen_key, predictions["ensemble"])
    
    # CPCB sub-indices and dominant pollutant
    pollutants_dict = {
        "pm25": f.pm25,
        "pm10": f.pm10,
        "no2": f.no2,
        "so2": f.so2,
        "co": f.co,
        "o3": f.o3
    }
    analysis = analyze_pollutants(pollutants_dict)
    category_info = get_aqi_category_info(primary_aqi)
    
    return {
        "model_used": chosen_key,
        "predicted_aqi": primary_aqi,
        "category_info": category_info,
        "dominant_pollutant": analysis["dominant_pollutant"],
        "sub_indices": analysis["sub_indices"],
        "model_comparison": predictions,
        "standard": "CPCB NAQI (India)"
    }


@app.post("/api/simulate")
def simulate_scenario(req: SimulationRequest):
    """
    Counterfactual simulation for Indian air quality interventions:
    Simulates Odd-Even vehicle rationing, anti-smog guns, industrial shutdown,
    and stubble burning prevention.
    """
    f = req.base_features
    tr_ratio = 1.0 - (req.traffic_reduction_pct / 100.0)
    ind_ratio = 1.0 - (req.industrial_reduction_pct / 100.0)
    wind_ratio = 1.0 + (req.wind_speed_change_pct / 100.0)
    
    sim_pm25 = max(2.0, f.pm25 * (0.35 + 0.40 * tr_ratio + 0.25 * ind_ratio))
    sim_pm10 = max(5.0, f.pm10 * (0.40 + 0.20 * tr_ratio + 0.40 * ind_ratio))
    sim_no2 = max(2.0, f.no2 * tr_ratio)
    sim_co = max(0.1, f.co * tr_ratio)
    sim_so2 = max(1.0, f.so2 * ind_ratio)
    sim_wind = max(0.5, f.wind_speed * wind_ratio)
    
    if wind_ratio > 1.0:
        disp_relief = 1.0 / (1.0 + 0.18 * (wind_ratio - 1.0))
        sim_pm25 *= disp_relief
        sim_pm10 *= disp_relief
        
    sim_features = FeaturesInput(
        pm25=round(sim_pm25, 1),
        pm10=round(sim_pm10, 1),
        no2=round(sim_no2, 1),
        so2=round(sim_so2, 1),
        co=round(sim_co, 2),
        o3=f.o3,
        temperature=f.temperature,
        humidity=f.humidity,
        wind_speed=round(sim_wind, 1)
    )
    
    baseline_res = predict_aqi(PredictionRequest(model_name="random_forest", features=f))
    sim_res = predict_aqi(PredictionRequest(model_name="random_forest", features=sim_features))
    
    base_aqi = baseline_res["predicted_aqi"]
    sim_aqi = sim_res["predicted_aqi"]
    diff = round(base_aqi - sim_aqi, 1)
    pct_reduction = round((diff / base_aqi) * 100.0, 1) if base_aqi > 0 else 0.0
    
    return {
        "baseline_aqi": base_aqi,
        "baseline_category": baseline_res["category_info"]["category"],
        "simulated_aqi": sim_aqi,
        "simulated_category": sim_res["category_info"]["category"],
        "aqi_reduction": diff,
        "percent_improvement": pct_reduction,
        "simulated_features": sim_features.dict()
    }


@app.get("/api/presets")
def get_presets():
    """Returns authentic Indian atmospheric scenarios."""
    return {
        "delhi_winter_smog": {
            "name": "Delhi Severe Winter Smog (Anand Vihar)",
            "tag": "Severe (AQI ~435)",
            "description": "Post-harvest stubble burning (Parali) & dense winter thermal inversion with near-zero wind.",
            "features": {
                "pm25": 240.0, "pm10": 415.0, "no2": 110.0, "so2": 32.0, "co": 4.8, "o3": 28.0,
                "temperature": 11.5, "humidity": 88.0, "wind_speed": 1.6
            }
        },
        "delhi_traffic_peak": {
            "name": "Delhi ITO Arterial Rush Hour",
            "tag": "Very Poor (AQI ~315)",
            "description": "Heavy vehicular exhaust, diesel idling, and high NO2/CO build-up across central ring roads.",
            "features": {
                "pm25": 160.0, "pm10": 285.0, "no2": 125.0, "so2": 24.0, "co": 4.6, "o3": 44.0,
                "temperature": 23.0, "humidity": 68.0, "wind_speed": 4.2
            }
        },
        "mumbai_coastal": {
            "name": "Mumbai BKC (Coastal Dispersion)",
            "tag": "Moderate (AQI ~125)",
            "description": "High humidity maritime climate where Arabian Sea breeze helps disperse local vehicular smoke.",
            "features": {
                "pm25": 58.0, "pm10": 118.0, "no2": 64.0, "so2": 16.0, "co": 1.6, "o3": 35.0,
                "temperature": 29.5, "humidity": 82.0, "wind_speed": 14.2
            }
        },
        "bengaluru_tech": {
            "name": "Bengaluru Silk Board / BTM",
            "tag": "Satisfactory (AQI ~88)",
            "description": "Deccan plateau elevation with moderate temperatures and traffic-dominant local emissions.",
            "features": {
                "pm25": 42.0, "pm10": 85.0, "no2": 56.0, "so2": 8.5, "co": 1.9, "o3": 44.0,
                "temperature": 24.0, "humidity": 62.0, "wind_speed": 11.5
            }
        },
        "monsoon_clean": {
            "name": "Monsoon Heavy Rain Washout (India)",
            "tag": "Good (AQI ~32)",
            "description": "Wet deposition and aerosol scavenging during peak Southwest monsoon showers.",
            "features": {
                "pm25": 14.0, "pm10": 26.0, "no2": 18.0, "so2": 5.0, "co": 0.65, "o3": 22.0,
                "temperature": 27.0, "humidity": 94.0, "wind_speed": 16.5
            }
        },
        "dust_storm_andhi": {
            "name": "Pre-Monsoon Dust Storm (Andhi / Loo)",
            "tag": "Poor to Very Poor (AQI ~295)",
            "description": "Arid convective dust storm from the Thar desert driving severe PM10 spikes across northern plains.",
            "features": {
                "pm25": 85.0, "pm10": 340.0, "no2": 38.0, "so2": 15.0, "co": 1.5, "o3": 85.0,
                "temperature": 41.5, "humidity": 22.0, "wind_speed": 28.0
            }
        }
    }


@app.get("/api/historical-sample")
def get_historical_sample():
    """
    Returns realistic 24-hour diurnal profile modeled after Delhi CAAQM observations.
    Captures night-time inversion accumulation, morning office rush, afternoon solar ozone peak,
    and evening post-dusk inversion spike.
    """
    hours = list(range(24))
    pm25_trend = [
        185, 192, 198, 205, 215, 245, 290, 310, 275, 210, 165, 140,
        135, 138, 145, 160, 195, 255, 298, 285, 260, 235, 210, 195
    ]
    pm10_trend = [int(p * 1.75 + 25) for p in pm25_trend]
    o3_trend = [
        22, 18, 15, 14, 12, 16, 24, 38, 55, 75, 92, 108,
        115, 112, 104, 88, 64, 45, 32, 28, 26, 24, 23, 22
    ]
    aqi_trend = [
        max(int(p * 1.15), int(o * 1.2)) for p, o in zip(pm25_trend, o3_trend)
    ]
    
    return {
        "labels": [f"{h:02d}:00" for h in hours],
        "pm25": pm25_trend,
        "pm10": pm10_trend,
        "o3": o3_trend,
        "aqi": aqi_trend
    }


@app.get("/api/phase2-info")
def get_phase2_info():
    """
    Academic Project Progress Metadata for Phase 2 Evaluation (8/10/2026 - 12/10/2026).
    Includes evaluation summary, metrics, and Google Form submission evidence.
    """
    models, scaler, metadata = get_models()
    return {
        "project_title": "AeroAI: Machine Learning-Based Multi-Pollutant Air Quality Index (AQI) Prediction and Atmospheric Risk Modeling for Indian Megacities",
        "phase": "Phase 2 Evaluation",
        "evaluation_window": "08-Oct-2026 to 12-Oct-2026",
        "current_status": "Phase 2 Prototype Implementation Complete & Demonstrated",
        "demo_link": "http://localhost:8000",
        "google_form_link": "https://docs.google.com/forms/d/e/1FAIpQLScJQ-8sw7889SSnuVRNjNiZe3cKDujelKanh93g6JkFoArdQA/viewform",
        "work_completed_phase1": [
            "Problem definition and literature review on Indian urban air quality challenges (CPCB NAQI).",
            "Atmospheric parameter identification: PM2.5, PM10, NO2, SO2, CO, O3, Temp, Humidity, Wind Speed.",
            "System architecture design separating data preprocessing, model inference, and analytics frontend."
        ],
        "work_completed_phase2": [
            "Dataset formulation & ingestion calibrated against CPCB CAAQM records (7,000 observations).",
            "Implementation of official CPCB NAQI piecewise sub-index mathematical engine.",
            "Training & comparative evaluation of 4 Machine Learning models: Gradient Boosting (R²=0.9996), Random Forest (R²=0.9995), Decision Tree (R²=0.9995), and Linear Baseline.",
            "Development of interactive real-time prediction dashboard with synchronized dual-control sliders and dynamic SVG gauge.",
            "Integration of New Delhi CAAQM Station Registry (Anand Vihar, ITO, RK Puram, Punjabi Bagh, Rohini, Lodhi Road) and major Indian Metros (Mumbai, Bengaluru, Kolkata, Lucknow, Ahmedabad, Chennai).",
            "Counterfactual 'What-If' policy intervention simulator (Traffic curbs, industrial scrubbers, dispersion dynamics).",
            "Diurnal 24-hour time-series trend analytics and feature importance extraction."
        ],
        "planned_for_phase3": [
            "Hardware IoT Node interface with physical particulate sensors (Plantower PMS5003) and gas sensors (MQ-135) connected via ESP32 microcontrollers.",
            "Model edge-quantization (TensorFlow Lite / ONNX) for low-power microcontroller deployment.",
            "Push-notification alert system via WebSockets / Mobile App for severe GRAP Stage IV alerts."
        ],
        "metrics_summary": metadata.get("metrics", {})
    }


if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
