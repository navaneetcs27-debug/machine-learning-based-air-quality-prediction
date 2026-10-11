"""
Indian National Air Quality Index (NAQI) Calculation Module
Formulated by the Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change (MoEFCC), Govt. of India.
Computes sub-indices for PM2.5, PM10, NO2, SO2, CO, and O3 using Indian standards,
categorizing air quality into Good, Satisfactory, Moderately Polluted, Poor, Very Poor, and Severe.
"""

from typing import Dict, Any, Tuple

# CPCB NAQI Breakpoint tables: (C_low, C_high, I_low, I_high)
# Concentrations: PM2.5 (ug/m3), PM10 (ug/m3), NO2 (ug/m3), SO2 (ug/m3), CO (mg/m3), O3 (ug/m3)
CPCB_BREAKPOINTS = {
    "pm25": [
        (0.0, 30.0, 0, 50),
        (31.0, 60.0, 51, 100),
        (61.0, 90.0, 101, 200),
        (91.0, 120.0, 201, 300),
        (121.0, 250.0, 301, 400),
        (251.0, 500.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (51.0, 100.0, 51, 100),
        (101.0, 250.0, 101, 200),
        (251.0, 350.0, 201, 300),
        (351.0, 430.0, 301, 400),
        (431.0, 600.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (41.0, 80.0, 51, 100),
        (81.0, 180.0, 101, 200),
        (181.0, 280.0, 201, 300),
        (281.0, 400.0, 301, 400),
        (401.0, 600.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (41.0, 80.0, 51, 100),
        (81.0, 380.0, 101, 200),
        (381.0, 800.0, 201, 300),
        (801.0, 1600.0, 301, 400),
        (1601.0, 2000.0, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (51.0, 100.0, 51, 100),
        (101.0, 168.0, 101, 200),
        (169.0, 208.0, 201, 300),
        (209.0, 748.0, 301, 400),
        (749.0, 1000.0, 401, 500),
    ],
}

def calculate_sub_index(pollutant: str, concentration: float) -> float:
    """Calculate CPCB NAQI sub-index using piecewise linear interpolation."""
    pollutant_key = pollutant.lower().replace(".", "").replace("-", "")
    if pollutant_key not in CPCB_BREAKPOINTS:
        return 0.0
    
    val = max(0.0, float(concentration))
    table = CPCB_BREAKPOINTS[pollutant_key]
    
    # If exceeding max threshold, cap at 500
    if val >= table[-1][1]:
        return 500.0
        
    for c_low, c_high, i_low, i_high in table:
        if c_low <= val <= c_high:
            index = ((i_high - i_low) / (c_high - c_low)) * (val - c_low) + i_low
            return round(index, 1)
            
    return 0.0

def get_aqi_category_info(aqi_val: float) -> Dict[str, Any]:
    """
    Returns official Indian CPCB category name, color codes,
    health impact, and localized precautionary advisories.
    """
    val = round(aqi_val)
    if val <= 50:
        return {
            "category": "Good",
            "hindiCategory": "अच्छा (Good)",
            "level": "Clean & Healthy",
            "color": "#10b981",          # Emerald Green
            "textColor": "#064e3b",
            "description": "Minimal environmental and health impact.",
            "healthImplications": "Air quality is ideal. No risk of respiratory complications for any demographic.",
            "cautionaryStatement": "Enjoy outdoor sports, jogging, and natural ventilation freely.",
            "maskRecommended": "No mask required",
            "purifierRecommended": "Natural cross-ventilation encouraged"
        }
    elif val <= 100:
        return {
            "category": "Satisfactory",
            "hindiCategory": "संतोषजनक (Satisfactory)",
            "level": "Acceptable",
            "color": "#84cc16",          # Lime / Light Green
            "textColor": "#365314",
            "description": "Minor breathing discomfort to sensitive people.",
            "healthImplications": "People with lung diseases or chronic asthma might experience slight tightness during intense exertion.",
            "cautionaryStatement": "Healthy individuals can perform normal activities; sensitive persons should monitor prolonged exertion.",
            "maskRecommended": "Optional for hyper-sensitive groups",
            "purifierRecommended": "Standard ventilation"
        }
    elif val <= 200:
        return {
            "category": "Moderate",
            "hindiCategory": "मध्यम (Moderate)",
            "level": "Moderate Risk",
            "color": "#f59e0b",          # Amber Yellow
            "textColor": "#78350f",
            "description": "Breathing discomfort to people with asthma and heart diseases.",
            "healthImplications": "Noticeable cough and throat irritation in children, senior citizens, and people with cardiovascular vulnerabilities.",
            "cautionaryStatement": "Reduce prolonged heavy exertion along busy vehicular corridors and arterial roads.",
            "maskRecommended": "Cloth or surgical mask recommended in high-traffic zones",
            "purifierRecommended": "Close windows during morning peak traffic"
        }
    elif val <= 300:
        return {
            "category": "Poor",
            "hindiCategory": "खराब (Poor)",
            "level": "Unhealthy",
            "color": "#f97316",          # Deep Orange
            "textColor": "#7c2d12",
            "description": "Breathing discomfort to most people on prolonged exposure.",
            "healthImplications": "Widespread respiratory irritation; aggravates asthma, bronchitis, and coronary heart conditions.",
            "cautionaryStatement": "Avoid morning walks and strenuous outdoor activities near traffic corridors. Keep vulnerable members indoors.",
            "maskRecommended": "N95 / KN95 mask recommended during commutes",
            "purifierRecommended": "Run indoor air purifiers in bedrooms"
        }
    elif val <= 400:
        return {
            "category": "Very Poor",
            "hindiCategory": "बहुत खराब (Very Poor)",
            "level": "Severe Health Hazard",
            "color": "#ef4444",          # Crimson Red
            "textColor": "#7f1d1d",
            "description": "Respiratory illness on prolonged exposure.",
            "healthImplications": "Severe impact on patients with lung or heart diseases. Healthy population will also experience chest discomfort.",
            "cautionaryStatement": "Avoid any strenuous outdoor activities. High alert for Delhi NCR school activities & sports.",
            "maskRecommended": "Mandatory N95 / FFP2 respirator outdoors",
            "purifierRecommended": "Seal room doors and run HEPA filtration continuously"
        }
    else:
        return {
            "category": "Severe",
            "hindiCategory": "गंभीर (Severe / Hazardous)",
            "level": "Emergency Medical Alert",
            "color": "#881337",          # Deep Maroon
            "textColor": "#4c0519",
            "description": "Affects healthy people and seriously impacts those with existing diseases.",
            "healthImplications": "Extreme emergency: Acute respiratory distress, cardiovascular stress, and widespread bronchial inflammation.",
            "cautionaryStatement": "GRAP Stage IV emergency guidelines apply: Stay indoors, avoid all outdoor physical exposure, avoid burning any fuel.",
            "maskRecommended": "Emergency exposure only with N99 / P100 respirator",
            "purifierRecommended": "Continuous HEPA filtration in sealed rooms"
        }

def analyze_pollutants(pollutants: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes individual CPCB sub-indices for each pollutant, finds the governing driver,
    and returns comprehensive breakdown.
    """
    sub_indices = {}
    for key, val in pollutants.items():
        sub_indices[key] = calculate_sub_index(key, val)
    
    dominant_pollutant = max(sub_indices, key=sub_indices.get) if sub_indices else "pm25"
    max_sub_index = sub_indices.get(dominant_pollutant, 0.0)
    
    return {
        "sub_indices": sub_indices,
        "dominant_pollutant": dominant_pollutant.upper(),
        "dominant_sub_index": max_sub_index
    }
