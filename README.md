# AeroAI - Machine Learning Based Air Quality Prediction Engine

AeroAI is an end-to-end, high-precision atmospheric Machine Learning system designed to predict the **Air Quality Index (AQI)**, identify governing pollutant drivers, calculate official **EPA sub-indices**, evaluate health risks, and simulate civic policy interventions.

---

## 🌟 Key Highlights

- **Multi-Model Machine Learning Suite**:
  - **Gradient Boosting Regressor**: $R^2 = 0.9989$ | $\text{MAE} = 1.75$ | $\text{RMSE} = 4.08$
  - **Random Forest Regressor**: $R^2 = 0.9981$ | $\text{MAE} = 1.57$ | $\text{RMSE} = 5.25$
  - **Decision Tree Regressor**: $R^2 = 0.9919$ | $\text{MAE} = 2.29$ | $\text{RMSE} = 10.96$
  - **Linear Regression Baseline**: $R^2 = 0.9628$ | $\text{MAE} = 17.26$ | $\text{RMSE} = 23.52$
  - **Ensemble Average**: Blends top non-linear tree models for maximum generalization.

- **Atmospheric & Meteorological Features**:
  - **Particulate Matter**: $\text{PM}_{2.5}$ (Fine particulates, $\mu\text{g/m}^3$), $\text{PM}_{10}$ (Coarse dust, $\mu\text{g/m}^3$)
  - **Combustion & Photochemical Gases**: $\text{NO}_2$ (Nitrogen Dioxide, $\text{ppb}$), $\text{SO}_2$ (Sulfur Dioxide, $\text{ppb}$), $\text{CO}$ (Carbon Monoxide, $\text{ppm}$), $\text{O}_3$ (Ground-level Ozone, $\text{ppb}$)
  - **Meteorology**: Ambient Temperature ($^\circ\text{C}$), Relative Humidity ($\%$), Wind Speed ($\text{km/h}$)

- **Environmental Chemistry & Physics**:
  - Incorporates wind dispersion decay ($\text{pollutant concentration} \propto \frac{1}{\text{wind speed}}$).
  - Models photochemical smog reaction ($\text{NO}_x + \text{VOCs} + \text{Sunlight/Heat} \rightarrow \text{O}_3$).
  - Captures cold winter thermal inversion particulate trapping.

- **EPA Standard Breakpoints & Sub-Indices**:
  - Computes exact EPA piecewise sub-indices for all 6 pollutants.
  - Automatically identifies the dominant pollutant driver governing the overall AQI.

- **Dynamic Interactive Dashboard**:
  - **Speedometer-Style Circular Gauge**: Smooth SVG transitions color-coded across all 6 EPA hazard categories:
    - 🟢 **Good** (0–50)
    - 🟡 **Moderate** (51–100)
    - 🟠 **Unhealthy for Sensitive Groups** (101–150)
    - 🔴 **Unhealthy** (151–200)
    - 🟣 **Very Unhealthy** (201–300)
    - 🟤 **Hazardous** (301–500)
  - **Live Sliders & Numeric Inputs** with real-time model inference.
  - **Quick Scenario Presets**: Pristine Mountain, Suburban Green, City Center Normal, Rush Hour Highway, Winter Thermal Smog, and Heavy Industrial Belt.
  - **"What-If" Policy Simulator**: Interactively test policy scenarios (e.g. Traffic emission cuts, Industrial scrubbers, Wind dispersion).
  - **Analytics & Model Insights**: Chart.js charts for multi-model benchmarks, feature importance rankings, and 24-hour diurnal trends.

---

## 📁 Repository Structure

```
c:\Ml based air quality prediction/
├── .venv/                      # Standalone Python 3.11 virtual environment
├── data/
│   ├── generate_dataset.py     # Atmospheric dataset generator (6,000 samples)
│   └── air_quality_data.csv    # Multi-pollutant & meteorological training data
├── models/
│   ├── train_models.py         # Training pipeline for RF, GB, DT, and Linear Regression
│   ├── random_forest.joblib    # Serialized Random Forest model
│   ├── gradient_boosting.joblib# Serialized Gradient Boosting model
│   ├── decision_tree.joblib    # Serialized Decision Tree model
│   ├── linear_regression.joblib# Serialized Linear Regression model
│   ├── scaler.joblib           # Feature standardizer
│   └── model_metadata.json     # Evaluation metrics, feature importance, test comparisons
├── backend/
│   ├── app.py                  # FastAPI server with prediction & simulation endpoints
│   └── aqi_calculator.py       # EPA standard breakpoints, sub-index formulas & health advisories
├── frontend/
│   ├── index.html              # Modern dark-mode dashboard
│   ├── css/
│   │   └── style.css           # Glassmorphism design system & animations
│   └── js/
│       ├── app.js              # Real-time state management, gauge animation, presets
│       └── charts.js           # Chart.js visualization configurations
├── run_server.py               # Unified application launcher
├── start.bat                   # 1-Click Windows execution script
└── requirements.txt            # Python dependencies
```

---

## 🚀 Quick Start Guide

### 1. Launch the Application
Run the launcher script in PowerShell or terminal:
```powershell
.\.venv\Scripts\python.exe run_server.py
```
*(Or double-click `start.bat` on Windows)*

### 2. Access the Dashboard
Open your web browser and navigate to:
- **Web Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Interactive REST API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 REST API Reference

### 1. Run ML Prediction
- **Endpoint**: `POST /api/predict`
- **Request Body**:
  ```json
  {
    "model_name": "random_forest",
    "features": {
      "pm25": 28.5,
      "pm10": 62.0,
      "no2": 48.0,
      "so2": 14.0,
      "co": 2.8,
      "o3": 44.0,
      "temperature": 26.0,
      "humidity": 60.0,
      "wind_speed": 8.5
    }
  }
  ```
- **Response**:
  ```json
  {
    "model_used": "random_forest",
    "predicted_aqi": 85.5,
    "category_info": {
      "category": "Moderate",
      "level": "Acceptable",
      "color": "#f59e0b",
      "maskRecommended": "Optional for sensitive individuals"
    },
    "dominant_pollutant": "PM2.5",
    "sub_indices": { "pm25": 85.5, "pm10": 54.5, "no2": 45.3, "so2": 20.0, "co": 31.8, "o3": 40.7 },
    "model_comparison": { "random_forest": 85.5, "gradient_boosting": 85.3, "decision_tree": 83.9, "linear_regression": 85.7, "ensemble": 85.4 }
  }
  ```

### 2. "What-If" Counterfactual Simulation
- **Endpoint**: `POST /api/simulate`
- **Simulates**: Policy interventions (Traffic cuts, industrial controls, dispersion factors) and computes net AQI reduction.

### 3. Model Benchmark Metadata
- **Endpoint**: `GET /api/models/info`
- **Returns**: $R^2$, MAE, RMSE, MAPE scores, and feature importance rankings.

---

## 📊 Model Evaluation Results

| Model | $R^2$ Score | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Mean Absolute % Error |
| :--- | :---: | :---: | :---: | :---: |
| **Gradient Boosting Regressor** | **0.9989** | **1.75 AQI** | **4.08 AQI** | **2.14%** |
| **Random Forest Regressor** | **0.9981** | **1.57 AQI** | **5.25 AQI** | **1.75%** |
| **Decision Tree Regressor** | **0.9919** | **2.29 AQI** | **10.96 AQI** | **2.29%** |
| **Linear Regression (Baseline)** | **0.9628** | **17.26 AQI** | **23.52 AQI** | **18.63%** |

### Top Predictive Feature Contributions
1. **$\text{PM}_{10}$ / $\text{PM}_{2.5}$**: Dominates particulate sub-indices (typically > 95% combined feature importance).
2. **$\text{O}_3$ (Ground-level Ozone)**: Primary driver during high-temperature photochemical summer conditions.
3. **$\text{CO}$ & $\text{NO}_2$**: Significant urban combustion and rush-hour secondary drivers.
4. **Wind Speed**: Negative correlation driver controlling atmospheric dispersion.
