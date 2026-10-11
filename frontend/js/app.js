/**
 * AeroAI Frontend Application Core Logic
 * Calibrated for CPCB Indian NAQI standards & New Delhi CAAQM Telemetry
 * Academic Phase 2 Evaluation Prototype (Oct 2026)
 */

const API_BASE = ''; // Same origin

// State
let currentModel = 'random_forest';
let currentCityFilter = 'delhi'; // 'delhi' or 'all'
let indianCitiesData = {};
let presetsData = {};

let currentFeatures = {
  pm25: 215.0,
  pm10: 385.0,
  no2: 95.0,
  so2: 28.0,
  co: 3.8,
  o3: 42.0,
  temperature: 18.5,
  humidity: 78.0,
  wind_speed: 3.2
};

let debounceTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupTimeDisplay();
  setupParamSync();
  setupModelSelector();
  setupButtons();
  setupSimulationSliders();
  setupCityFilterTabs();
  setupEvaluationModal();

  await loadIndianCities();
  await loadPresets();
  await loadModelMetadata();
  await loadDiurnalData();

  // Initial prediction on Delhi Anand Vihar hotspot
  triggerPrediction();
});

function setupTimeDisplay() {
  const timeEl = document.getElementById('currentTimeDisplay');
  if (!timeEl) return;
  const update = () => {
    const now = new Date();
    timeEl.textContent = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`;
  };
  update();
  setInterval(update, 1000);
}

/**
 * Links range sliders with numeric inputs bidirectionally
 */
function setupParamSync() {
  const paramKeys = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'temperature', 'humidity', 'wind_speed'];

  paramKeys.forEach(key => {
    const slider = document.getElementById(`slider_${key}`);
    const numInput = document.getElementById(`input_${key}`);

    if (slider && numInput) {
      slider.addEventListener('input', (e) => {
        numInput.value = e.target.value;
        currentFeatures[key] = parseFloat(e.target.value);
        debouncedPredict();
      });

      numInput.addEventListener('input', (e) => {
        slider.value = e.target.value;
        currentFeatures[key] = parseFloat(e.target.value) || 0;
        debouncedPredict();
      });
    }
  });
}

function updateInputsFromFeatures(features) {
  Object.keys(features).forEach(key => {
    const slider = document.getElementById(`slider_${key}`);
    const numInput = document.getElementById(`input_${key}`);
    if (slider && numInput) {
      slider.value = features[key];
      numInput.value = features[key];
      currentFeatures[key] = features[key];
    }
  });
}

function setupModelSelector() {
  const selector = document.getElementById('modelSelector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      currentModel = e.target.value;
      triggerPrediction();
    });
  }
}

function setupButtons() {
  const predictBtn = document.getElementById('runPredictBtn');
  if (predictBtn) {
    predictBtn.addEventListener('click', () => triggerPrediction());
  }

  const randomBtn = document.getElementById('randomizeBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => randomizeSensors());
  }

  const resetBtn = document.getElementById('resetCleanBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (indianCitiesData['delhi_lodhi_road']) {
        applyStation('delhi_lodhi_road');
      }
    });
  }
}

function setupCityFilterTabs() {
  const btnDelhi = document.getElementById('tabFilterDelhi');
  const btnAll = document.getElementById('tabFilterAll');

  if (btnDelhi && btnAll) {
    btnDelhi.addEventListener('click', () => {
      currentCityFilter = 'delhi';
      btnDelhi.classList.add('active');
      btnAll.classList.remove('active');
      renderStationButtons();
    });

    btnAll.addEventListener('click', () => {
      currentCityFilter = 'all';
      btnAll.classList.add('active');
      btnDelhi.classList.remove('active');
      renderStationButtons();
    });
  }
}

async function loadIndianCities() {
  try {
    const res = await fetch(`${API_BASE}/api/indian-cities`);
    if (!res.ok) return;
    indianCitiesData = await res.json();
    renderStationButtons();
  } catch (err) {
    console.warn('Failed to load Indian cities:', err);
  }
}

function renderStationButtons() {
  const container = document.getElementById('stationsContainer');
  if (!container) return;
  container.innerHTML = '';

  const keys = Object.keys(indianCitiesData);
  const filteredKeys = keys.filter(k => {
    if (currentCityFilter === 'delhi') {
      return indianCitiesData[k].city === 'New Delhi';
    }
    return true;
  });

  filteredKeys.forEach((key, idx) => {
    const s = indianCitiesData[key];
    const btn = document.createElement('button');
    btn.className = `station-btn ${key === 'delhi_anand_vihar' ? 'active' : ''}`;
    btn.id = `stationBtn_${key}`;
    btn.innerHTML = `
      <span class="station-name">${s.city === 'New Delhi' ? '📍' : '🏙️'} ${s.station}</span>
      <span class="station-zone">${s.zone}</span>
      <span class="station-tag">${s.city}, ${s.state}</span>
    `;
    btn.addEventListener('click', () => applyStation(key));
    container.appendChild(btn);
  });
}

function applyStation(key) {
  const s = indianCitiesData[key];
  if (!s) return;

  document.querySelectorAll('.station-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`stationBtn_${key}`);
  if (btn) btn.classList.add('active');

  // Also update active city banner info
  const stationBanner = document.getElementById('currentStationInfo');
  if (stationBanner) {
    stationBanner.textContent = `Active Station: ${s.station} (${s.city}, ${s.state}) — ${s.description}`;
  }

  updateInputsFromFeatures(s.features);
  triggerPrediction();
}

function randomizeSensors() {
  const rand = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
  const randomized = {
    pm25: rand(25, 320),
    pm10: rand(50, 480),
    no2: rand(20, 160),
    so2: rand(8, 65),
    co: rand(0.8, 8.5, 2),
    o3: rand(15, 95),
    temperature: rand(12, 42),
    humidity: rand(25, 88),
    wind_speed: rand(1.2, 22)
  };
  updateInputsFromFeatures(randomized);
  triggerPrediction();
}

function debouncedPredict() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerPrediction();
  }, 120);
}

/**
 * Executes inference request to the ML API
 */
async function triggerPrediction() {
  try {
    const payload = {
      model_name: currentModel,
      features: currentFeatures
    };

    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Prediction API error');
    const data = await res.json();
    renderPredictionResults(data);

    runSimulation();
  } catch (err) {
    console.error('Prediction failed:', err);
  }
}

/**
 * Updates UI with prediction results, CPCB gauge, sub-indices, health advice
 */
function renderPredictionResults(data) {
  const aqiVal = data.predicted_aqi;
  const cat = data.category_info;

  // 1. Numerical AQI Display
  const numEl = document.getElementById('aqiValueNumber');
  if (numEl) {
    numEl.textContent = Math.round(aqiVal);
    numEl.style.color = cat.color;
  }

  // 2. Animated Gauge SVG Arc
  const gaugeFill = document.getElementById('gaugeFillArc');
  if (gaugeFill) {
    const clampedAQI = Math.min(Math.max(aqiVal, 0), 500);
    const progress = clampedAQI / 500;
    const offset = 440 - (progress * 220);
    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = cat.color;
  }

  // 3. CPCB NAQI Category Badge Box (English + Hindi)
  const badgeEl = document.getElementById('categoryBadge');
  if (badgeEl) {
    badgeEl.innerHTML = `<span>${cat.category}</span> <span class="cpcb-hindi-text">(${cat.hindiCategory || ''})</span>`;
    badgeEl.style.background = cat.color;
    badgeEl.style.color = cat.textColor;
    badgeEl.style.boxShadow = `0 4px 20px ${cat.color}60`;
  }

  // 4. Dominant Pollutant Driver
  const domEl = document.getElementById('dominantPollutantBadge');
  if (domEl) {
    domEl.textContent = data.dominant_pollutant;
    domEl.style.color = cat.color;
  }

  // 5. Model Mini Cards Comparison
  const comparisons = data.model_comparison || {};
  ['random_forest', 'gradient_boosting', 'decision_tree', 'linear_regression'].forEach(key => {
    const valEl = document.getElementById(`val_${key}`);
    const cardEl = document.getElementById(`card_${key}`);
    if (valEl) valEl.textContent = comparisons[key] !== undefined ? comparisons[key] : '--';
    if (cardEl) {
      if (key === currentModel) {
        cardEl.classList.add('active-model');
      } else {
        cardEl.classList.remove('active-model');
      }
    }
  });

  // 6. CPCB Sub-Indices Breakdown Progress Bars
  const subs = data.sub_indices || {};
  Object.keys(subs).forEach(k => {
    const subVal = subs[k];
    const valTextEl = document.getElementById(`subval_${k}`);
    const barEl = document.getElementById(`subbar_${k}`);
    if (valTextEl) valTextEl.textContent = `${subVal} AQI`;
    if (barEl) {
      const pct = Math.min((subVal / 400) * 100, 100);
      barEl.style.width = `${pct}%`;
      // CPCB color bands
      if (subVal <= 50) barEl.style.background = '#10b981';
      else if (subVal <= 100) barEl.style.background = '#84cc16';
      else if (subVal <= 200) barEl.style.background = '#f59e0b';
      else if (subVal <= 300) barEl.style.background = '#f97316';
      else if (subVal <= 400) barEl.style.background = '#ef4444';
      else barEl.style.background = '#881337';
    }
  });

  // 7. Health & GRAP Advisory Details
  const levelEl = document.getElementById('advisoryLevel');
  if (levelEl) {
    levelEl.textContent = cat.level;
    levelEl.style.color = cat.color;
  }
  const generalEl = document.getElementById('advisoryGeneral');
  if (generalEl) generalEl.textContent = cat.description;

  const maskEl = document.getElementById('advisoryMask');
  if (maskEl) maskEl.textContent = cat.maskRecommended;

  const purifierEl = document.getElementById('advisoryPurifier');
  if (purifierEl) purifierEl.textContent = cat.purifierRecommended;

  const outdoorEl = document.getElementById('advisoryOutdoor');
  if (outdoorEl) outdoorEl.textContent = cat.cautionaryStatement;
}

/**
 * Load Quick Presets
 */
async function loadPresets() {
  try {
    const res = await fetch(`${API_BASE}/api/presets`);
    if (!res.ok) return;
    presetsData = await res.json();

    const container = document.getElementById('presetsContainer');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(presetsData).forEach((key, idx) => {
      const p = presetsData[key];
      const btn = document.createElement('button');
      btn.className = `preset-btn ${idx === 0 ? 'active' : ''}`;
      btn.id = `presetBtn_${key}`;
      btn.innerHTML = `
        <span class="preset-btn-title">${p.name}</span>
        <span class="preset-btn-tag">${p.tag}</span>
      `;
      btn.addEventListener('click', () => applyPreset(key));
      container.appendChild(btn);
    });
  } catch (err) {
    console.warn('Could not load presets:', err);
  }
}

function applyPreset(key) {
  const p = presetsData[key];
  if (!p) return;

  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`presetBtn_${key}`);
  if (btn) btn.classList.add('active');

  updateInputsFromFeatures(p.features);
  triggerPrediction();
}

/**
 * Simulation sliders and calculation
 */
function setupSimulationSliders() {
  const sTraffic = document.getElementById('simTrafficSlider');
  const sInd = document.getElementById('simIndSlider');
  const sWind = document.getElementById('simWindSlider');

  const lblTraffic = document.getElementById('simTrafficVal');
  const lblInd = document.getElementById('simIndVal');
  const lblWind = document.getElementById('simWindVal');

  const updateSim = () => {
    if (lblTraffic) lblTraffic.textContent = `${sTraffic.value}%`;
    if (lblInd) lblInd.textContent = `${sInd.value}%`;
    if (lblWind) lblWind.textContent = `${sWind.value}%`;
    runSimulation();
  };

  [sTraffic, sInd, sWind].forEach(s => {
    if (s) s.addEventListener('input', updateSim);
  });
}

async function runSimulation() {
  const sTraffic = document.getElementById('simTrafficSlider');
  const sInd = document.getElementById('simIndSlider');
  const sWind = document.getElementById('simWindSlider');

  if (!sTraffic || !sInd || !sWind) return;

  const payload = {
    base_features: currentFeatures,
    traffic_reduction_pct: parseFloat(sTraffic.value) || 0,
    industrial_reduction_pct: parseFloat(sInd.value) || 0,
    wind_speed_change_pct: parseFloat(sWind.value) || 0
  };

  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return;
    const simData = await res.json();

    const baseEl = document.getElementById('simBaseVal');
    const simEl = document.getElementById('simResultVal');
    const diffEl = document.getElementById('simDiffBadge');

    if (baseEl) baseEl.textContent = Math.round(simData.baseline_aqi);
    if (simEl) simEl.textContent = Math.round(simData.simulated_aqi);

    if (diffEl) {
      if (simData.aqi_reduction > 0) {
        diffEl.textContent = `✓ Delhi NCR Projected Relief: -${simData.aqi_reduction} AQI (${simData.percent_improvement}% Reduction)`;
        diffEl.style.color = '#34d399';
        diffEl.style.background = 'rgba(16, 185, 129, 0.15)';
      } else if (simData.aqi_reduction < 0) {
        diffEl.textContent = `⚠ Air Degradation: +${Math.abs(simData.aqi_reduction)} AQI (${Math.abs(simData.percent_improvement)}% Worsening)`;
        diffEl.style.color = '#f87171';
        diffEl.style.background = 'rgba(239, 68, 68, 0.15)';
      } else {
        diffEl.textContent = `No GRAP intervention applied (Baseline Ambient State)`;
        diffEl.style.color = '#94a3b8';
        diffEl.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    }
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

/**
 * Loads metadata and renders benchmark & feature charts
 */
async function loadModelMetadata() {
  try {
    const res = await fetch(`${API_BASE}/api/models/info`);
    if (!res.ok) return;
    const metadata = await res.json();

    if (metadata.metrics && window.renderBenchmarkChart) {
      renderBenchmarkChart(metadata.metrics);
    }

    if (metadata.feature_importance_rf && window.renderFeatureImportanceChart) {
      renderFeatureImportanceChart(metadata.feature_importance_rf);
    }
  } catch (err) {
    console.warn('Metadata load error:', err);
  }
}

/**
 * Loads 24-hour diurnal profile
 */
async function loadDiurnalData() {
  try {
    const res = await fetch(`${API_BASE}/api/historical-sample`);
    if (!res.ok) return;
    const data = await res.json();
    if (window.renderDiurnalChart) {
      renderDiurnalChart(data);
    }
  } catch (err) {
    console.warn('Diurnal data load error:', err);
  }
}

/**
 * Setup Phase 2 Evaluation Modal handlers
 */
function setupEvaluationModal() {
  const modal = document.getElementById('phase2Modal');
  const openBtn = document.getElementById('openPhase2ModalBtn');
  const closeBtn = document.getElementById('closePhase2ModalBtn');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}
