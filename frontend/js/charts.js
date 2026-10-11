/**
 * Charts and Visualizations Module
 * Handles Chart.js initialization and updates for:
 * 1. Model Performance Benchmark (R2, MAE, RMSE)
 * 2. Feature Importance Analysis
 * 3. 24-Hour Diurnal Pollution & AQI Trends
 */

let benchmarkChartInstance = null;
let importanceChartInstance = null;
let diurnalChartInstance = null;

// Chart.js global dark theme defaults
if (window.Chart) {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif";
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
  Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
}

/**
 * Initializes or updates the Model Performance Benchmark Chart
 */
function renderBenchmarkChart(metricsData) {
  const ctx = document.getElementById('benchmarkChart');
  if (!ctx || !window.Chart) return;

  const modelLabels = [];
  const r2Scores = [];
  const maeScores = [];
  const rmseScores = [];

  const displayOrder = ['random_forest', 'gradient_boosting', 'decision_tree', 'linear_regression'];
  
  displayOrder.forEach(key => {
    const item = metricsData[key];
    if (item) {
      modelLabels.push(item.name.replace(' Regressor', ''));
      r2Scores.push(item.r2);
      maeScores.push(item.mae);
      rmseScores.push(item.rmse);
    }
  });

  if (benchmarkChartInstance) {
    benchmarkChartInstance.destroy();
  }

  benchmarkChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: modelLabels,
      datasets: [
        {
          label: 'R² Score (Accuracy)',
          data: r2Scores,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: '#6366f1',
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'yR2'
        },
        {
          label: 'MAE (Mean Abs Error)',
          data: maeScores,
          backgroundColor: 'rgba(6, 182, 212, 0.7)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'yError'
        },
        {
          label: 'RMSE (Root Mean Sq Error)',
          data: rmseScores,
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
          borderColor: '#f43f5e',
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'yError'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, padding: 16 }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        yR2: {
          type: 'linear',
          position: 'left',
          min: 0.90,
          max: 1.0,
          title: { display: true, text: 'R² Score (Higher is better)', color: '#6366f1' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        yError: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 30,
          title: { display: true, text: 'Error in AQI Points (Lower is better)', color: '#f43f5e' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

/**
 * Initializes or updates Feature Importance Horizontal Bar Chart
 */
function renderFeatureImportanceChart(importanceData) {
  const ctx = document.getElementById('featureImportanceChart');
  if (!ctx || !window.Chart) return;

  const featureLabels = {
    'pm10': 'PM10 (Coarse Dust)',
    'pm25': 'PM2.5 (Fine Particulates)',
    'o3': 'O3 (Ground Ozone)',
    'co': 'CO (Carbon Monoxide)',
    'no2': 'NO2 (Traffic Emissions)',
    'so2': 'SO2 (Industrial Sulfur)',
    'wind_speed': 'Wind Speed (Dispersion)',
    'temperature': 'Temperature (°C)',
    'humidity': 'Humidity (%)'
  };

  const labels = importanceData.map(d => featureLabels[d.feature] || d.feature.toUpperCase());
  const values = importanceData.map(d => d.importance);

  // Gradient colors
  const backgroundColors = values.map((val, idx) => {
    if (idx === 0) return 'rgba(99, 102, 241, 0.85)';
    if (idx === 1) return 'rgba(6, 182, 212, 0.85)';
    if (idx === 2) return 'rgba(16, 185, 129, 0.85)';
    return 'rgba(148, 163, 184, 0.45)';
  });

  if (importanceChartInstance) {
    importanceChartInstance.destroy();
  }

  importanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Relative Importance (%)',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          title: { display: true, text: 'Feature Weight (%)' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Initializes or updates 24-Hour Diurnal Cycle Chart
 */
function renderDiurnalChart(historicalData) {
  const ctx = document.getElementById('diurnalChart');
  if (!ctx || !window.Chart) return;

  if (diurnalChartInstance) {
    diurnalChartInstance.destroy();
  }

  diurnalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicalData.labels,
      datasets: [
        {
          label: 'Overall AQI',
          data: historicalData.aqi,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'PM2.5 (µg/m³)',
          data: historicalData.pm25,
          borderColor: '#f43f5e',
          tension: 0.35,
          borderWidth: 1.8,
          borderDash: [5, 5],
          pointRadius: 2
        },
        {
          label: 'PM10 (µg/m³)',
          data: historicalData.pm10,
          borderColor: '#8b5cf6',
          tension: 0.35,
          borderWidth: 1.8,
          pointRadius: 2
        },
        {
          label: 'Ozone O3 (ppb)',
          data: historicalData.o3,
          borderColor: '#06b6d4',
          tension: 0.35,
          borderWidth: 1.8,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, padding: 14 }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          min: 0,
          title: { display: true, text: 'Concentration / Index Points' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}
