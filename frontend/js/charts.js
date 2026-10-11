/**
 * Academic Chart.js Visualizations Module
 * Standard data science plotting style for college project demonstration:
 * 1. Model Performance Benchmark (R2 & MAE)
 * 2. Feature Importance Analysis
 * 3. 24-Hour Diurnal Pollution & AQI Trends
 */

let benchmarkChartInstance = null;
let importanceChartInstance = null;
let diurnalChartInstance = null;

if (window.Chart) {
  Chart.defaults.color = '#475569';
  Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
  Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = '#f1f5f9';
  Chart.defaults.plugins.tooltip.borderColor = '#cbd5e1';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 8;
  Chart.defaults.plugins.tooltip.cornerRadius = 4;
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
          label: 'Test R² Score',
          data: r2Scores,
          backgroundColor: '#1e40af',
          borderColor: '#172554',
          borderWidth: 1,
          borderRadius: 3,
          yAxisID: 'yR2'
        },
        {
          label: 'Mean Absolute Error (MAE)',
          data: maeScores,
          backgroundColor: '#e11d48',
          borderColor: '#9f1239',
          borderWidth: 1,
          borderRadius: 3,
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
          labels: { boxWidth: 12, padding: 12, font: { size: 11, weight: '600' } }
        }
      },
      scales: {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 11 } }
        },
        yR2: {
          type: 'linear',
          position: 'left',
          min: 0.90,
          max: 1.0,
          title: { display: true, text: 'R² Score (Higher is better)', color: '#1e40af', font: { size: 11, weight: '700' } },
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 10 } }
        },
        yError: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 30,
          title: { display: true, text: 'MAE in AQI Points (Lower is better)', color: '#e11d48', font: { size: 11, weight: '700' } },
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 10 } }
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
    'pm10': 'PM10 (Coarse Dust & Stubble Ash)',
    'pm25': 'PM2.5 (Fine Respirable Particulates)',
    'o3': 'O3 (Photochemical Ozone)',
    'co': 'CO (Carbon Monoxide)',
    'no2': 'NO2 (Vehicular Nitrogen Oxide)',
    'so2': 'SO2 (Industrial Sulfur)',
    'wind_speed': 'Wind Speed (Dispersion)',
    'temperature': 'Temperature (°C)',
    'humidity': 'Relative Humidity (%)'
  };

  const labels = importanceData.map(d => featureLabels[d.feature] || d.feature.toUpperCase());
  const values = importanceData.map(d => d.importance);

  if (importanceChartInstance) {
    importanceChartInstance.destroy();
  }

  importanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Feature Weight (%)',
        data: values,
        backgroundColor: '#0284c7',
        borderColor: '#0369a1',
        borderWidth: 1,
        borderRadius: 3
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
          title: { display: true, text: 'Relative Importance Weight (%)', font: { size: 11, weight: '700' } },
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 10 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
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
          label: 'Overall NAQI',
          data: historicalData.aqi,
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.08)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2.5
        },
        {
          label: 'PM2.5 (µg/m³)',
          data: historicalData.pm25,
          borderColor: '#dc2626',
          tension: 0.3,
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 1.5
        },
        {
          label: 'PM10 (µg/m³)',
          data: historicalData.pm10,
          borderColor: '#7c3aed',
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 1.5
        },
        {
          label: 'Ozone O3 (µg/m³)',
          data: historicalData.o3,
          borderColor: '#0284c7',
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 1.5
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
          labels: { boxWidth: 12, padding: 12, font: { size: 11, weight: '600' } }
        }
      },
      scales: {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 10 } }
        },
        y: {
          min: 0,
          title: { display: true, text: 'Concentration (µg/m³) / NAQI Points', font: { size: 11, weight: '700' } },
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}
