"""
Model Training & Evaluation Pipeline for Air Quality Prediction
Trains and evaluates multiple Machine Learning models:
1. Random Forest Regressor
2. Gradient Boosting Regressor
3. Decision Tree Regressor
4. Linear Regression (Baseline)
Computes comparative evaluation metrics (R2, MAE, RMSE, MAPE),
extracts feature importance rankings, and exports serialized models with metadata.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

def train_and_evaluate():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.abspath(os.path.join(base_dir, "..", "data", "air_quality_data.csv"))
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Please run generate_dataset.py first.")
        
    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records with columns: {list(df.columns)}")
    
    feature_cols = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity', 'wind_speed']
    target_col = 'aqi'
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    # Fit StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    scaler_path = os.path.join(base_dir, "scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"Saved StandardScaler to: {scaler_path}")
    
    # Initialize Models
    models = {
        "random_forest": {
            "name": "Random Forest Regressor",
            "model": RandomForestRegressor(n_estimators=100, max_depth=14, min_samples_split=4, random_state=42, n_jobs=-1),
            "use_scaled": False,
            "description": "Ensemble of 100 decision trees. Highly robust against sensor outliers and handles non-linear interactions excellently."
        },
        "gradient_boosting": {
            "name": "Gradient Boosting Regressor",
            "model": GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42),
            "use_scaled": False,
            "description": "Sequential boosting model that minimizes residual errors iteratively for high accuracy."
        },
        "decision_tree": {
            "name": "Decision Tree Regressor",
            "model": DecisionTreeRegressor(max_depth=10, min_samples_split=6, random_state=42),
            "use_scaled": False,
            "description": "Single recursive decision tree providing direct, transparent rule-based partitioning."
        },
        "linear_regression": {
            "name": "Linear Regression",
            "model": LinearRegression(),
            "use_scaled": True,
            "description": "Parametric baseline model demonstrating the limits of linear assumptions for non-linear atmospheric dynamics."
        }
    }
    
    results = {}
    
    for key, item in models.items():
        print(f"\n--- Training {item['name']} ---")
        m = item["model"]
        
        # Train
        if item["use_scaled"]:
            m.fit(X_train_scaled, y_train)
            y_pred = m.predict(X_test_scaled)
        else:
            m.fit(X_train, y_train)
            y_pred = m.predict(X_test)
            
        # Clip negative predictions to 0
        y_pred = np.clip(y_pred, 0.0, 500.0)
        
        # Metrics
        r2 = float(r2_score(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        mape = float(mean_absolute_percentage_error(y_test, y_pred) * 100.0)
        
        # Save model file
        model_save_path = os.path.join(base_dir, f"{key}.joblib")
        joblib.dump(m, model_save_path)
        print(f"Saved {key} model to {model_save_path}")
        print(f"Metrics: R² = {r2:.4f} | MAE = {mae:.2f} | RMSE = {rmse:.2f} | MAPE = {mape:.2f}%")
        
        results[key] = {
            "key": key,
            "name": item["name"],
            "description": item["description"],
            "use_scaled": item["use_scaled"],
            "r2": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2)
        }
        
    # Feature Importances (from best ensemble model: Random Forest)
    rf_model = models["random_forest"]["model"]
    importances = rf_model.feature_importances_
    feature_importance_list = [
        {"feature": feat, "importance": round(float(imp) * 100, 2)}
        for feat, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    ]
    
    # Gradient boosting feature importance
    gb_model = models["gradient_boosting"]["model"]
    gb_importances = gb_model.feature_importances_
    gb_importance_list = [
        {"feature": feat, "importance": round(float(imp) * 100, 2)}
        for feat, imp in sorted(zip(feature_cols, gb_importances), key=lambda x: x[1], reverse=True)
    ]
    
    # Sample actual vs predicted test points (for frontend comparison charts)
    sample_indices = np.random.choice(len(X_test), size=min(40, len(X_test)), replace=False)
    sample_actual = y_test.iloc[sample_indices].values.tolist()
    sample_rf_pred = rf_model.predict(X_test.iloc[sample_indices]).tolist()
    sample_gb_pred = gb_model.predict(X_test.iloc[sample_indices]).tolist()
    sample_lr_pred = models["linear_regression"]["model"].predict(X_test_scaled[sample_indices]).tolist()
    
    metadata = {
        "features": feature_cols,
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": results,
        "feature_importance_rf": feature_importance_list,
        "feature_importance_gb": gb_importance_list,
        "test_comparison": {
            "actual": [round(x, 1) for x in sample_actual],
            "random_forest": [round(x, 1) for x in sample_rf_pred],
            "gradient_boosting": [round(x, 1) for x in sample_gb_pred],
            "linear_regression": [round(x, 1) for x in sample_lr_pred],
        }
    }
    
    metadata_path = os.path.join(base_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"\nMetadata saved to {metadata_path}")
    print("\nTraining completed successfully!")

if __name__ == "__main__":
    train_and_evaluate()
