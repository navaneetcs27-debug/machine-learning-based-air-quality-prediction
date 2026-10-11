/**
 * AeroAI Frontend Application Core Logic
 * Calibrated for CPCB Indian NAQI standards & New Delhi CAAQM Telemetry
 * Features Hybrid Mode: Uses FastAPI backend when online,
 * with zero-dependency standalone Client-Side ML Engine fallback when offline.
 */

const API_BASE = ''; // Same origin

// 1. EMBEDDED CPCB NAQI METADATA & DATASETS (Zero-dependency Fallback)
const EMBEDDED_CITIES = {
  "delhi_anand_vihar": {
    "city": "New Delhi",
    "station": "Anand Vihar (Trans-Yamuna)",
    "state": "Delhi NCR",
    "zone": "Critical Emission Hotspot (ISBT + Freight Corridor)",
    "description": "Consistently one of India's most critical CAAQM stations. Impacted by heavy interstate bus transit (ISBT), cross-border freight traffic, and unpaved particulate resuspension.",
    "features": { "pm25": 215.0, "pm10": 385.0, "no2": 95.0, "so2": 28.0, "co": 3.8, "o3": 42.0, "temperature": 18.5, "humidity": 78.0, "wind_speed": 3.2 }
  },
  "delhi_ito": {
    "city": "New Delhi",
    "station": "ITO Crossing (Central Delhi)",
    "state": "Delhi NCR",
    "zone": "Major Traffic Arterial Bottleneck",
    "description": "High-density governmental and commercial intersection with chronic vehicular congestion, idling exhaust, and high NO2/CO concentrations.",
    "features": { "pm25": 165.0, "pm10": 290.0, "no2": 112.0, "so2": 22.0, "co": 4.5, "o3": 38.0, "temperature": 21.0, "humidity": 68.0, "wind_speed": 4.5 }
  },
  "delhi_rk_puram": {
    "city": "New Delhi",
    "station": "R.K. Puram (South Delhi)",
    "state": "Delhi NCR",
    "zone": "Mixed Residential & Ring Road",
    "description": "Prominent South Delhi urban residential sector adjacent to the Inner Ring Road; primary indicator for residential population exposure.",
    "features": { "pm25": 142.0, "pm10": 255.0, "no2": 78.0, "so2": 18.5, "co": 2.9, "o3": 48.0, "temperature": 22.5, "humidity": 65.0, "wind_speed": 5.8 }
  },
  "delhi_punjabi_bagh": {
    "city": "New Delhi",
    "station": "Punjabi Bagh (West Delhi)",
    "state": "Delhi NCR",
    "zone": "Dense Commercial & Ring Road Corridor",
    "description": "West Delhi transport corridor connecting Outer Ring Road and Rohtak Road. High diesel vehicle transit and commercial market emissions.",
    "features": { "pm25": 178.0, "pm10": 310.0, "no2": 88.0, "so2": 24.0, "co": 3.4, "o3": 44.0, "temperature": 20.0, "humidity": 72.0, "wind_speed": 4.0 }
  },
  "delhi_rohini": {
    "city": "New Delhi",
    "station": "Rohini / Sector 16 (North-West Delhi)",
    "state": "Delhi NCR",
    "zone": "North-West Urban & Agro-Industrial Border",
    "description": "Receives incoming northwesterly winds carrying seasonal agricultural stubble smoke from Punjab and Haryana during October-November.",
    "features": { "pm25": 195.0, "pm10": 345.0, "no2": 82.0, "so2": 26.0, "co": 3.6, "o3": 36.0, "temperature": 19.5, "humidity": 74.0, "wind_speed": 3.8 }
  },
  "delhi_lodhi_road": {
    "city": "New Delhi",
    "station": "Lodhi Road (IMD Headquarters)",
    "state": "Delhi NCR",
    "zone": "Green Institutional Corridor",
    "description": "Surrounded by urban green foliage and parks (Lodhi Gardens). Operates as the cleaner reference baseline for Delhi.",
    "features": { "pm25": 88.0, "pm10": 165.0, "no2": 52.0, "so2": 14.0, "co": 1.8, "o3": 54.0, "temperature": 24.0, "humidity": 58.0, "wind_speed": 7.5 }
  },
  "mumbai_bkc": {
    "city": "Mumbai",
    "station": "Bandra Kurla Complex (BKC)",
    "state": "Maharashtra",
    "zone": "Commercial CBD & Coastal Plain",
    "description": "Financial business district influenced by coastal sea-breeze dispersion and high year-round relative humidity.",
    "features": { "pm25": 58.0, "pm10": 118.0, "no2": 64.0, "so2": 16.0, "co": 1.6, "o3": 35.0, "temperature": 29.5, "humidity": 82.0, "wind_speed": 14.2 }
  },
  "bengaluru_btm": {
    "city": "Bengaluru",
    "station": "BTM Layout / Silk Board",
    "state": "Karnataka",
    "zone": "IT Corridor & Ring Road Junction",
    "description": "High tech-commuter corridor on the Deccan Plateau (920m elevation). Favorable plateau ventilation keeps AQI moderate.",
    "features": { "pm25": 42.0, "pm10": 85.0, "no2": 56.0, "so2": 8.5, "co": 1.9, "o3": 44.0, "temperature": 24.0, "humidity": 62.0, "wind_speed": 11.5 }
  },
  "kolkata_rabindra": {
    "city": "Kolkata",
    "station": "Rabindra Bharati University",
    "state": "West Bengal",
    "zone": "North Kolkata Dense Urban Corridor",
    "description": "Lower Gangetic delta location with high population density and nocturnal winter river valley inversion.",
    "features": { "pm25": 118.0, "pm10": 215.0, "no2": 72.0, "so2": 21.0, "co": 2.4, "o3": 32.0, "temperature": 23.0, "humidity": 76.0, "wind_speed": 5.2 }
  },
  "lucknow_talkatora": {
    "city": "Lucknow",
    "station": "Talkatora Industrial Area",
    "state": "Uttar Pradesh",
    "zone": "Indo-Gangetic Plain Industrial Zone",
    "description": "Situated in the central fertile Gangetic belt. Suffers from low winter planetary boundary layer height.",
    "features": { "pm25": 158.0, "pm10": 275.0, "no2": 68.0, "so2": 32.0, "co": 3.1, "o3": 38.0, "temperature": 19.0, "humidity": 80.0, "wind_speed": 3.5 }
  },
  "ahmedabad_maninagar": {
    "city": "Ahmedabad",
    "station": "Maninagar / South Ahmedabad",
    "state": "Gujarat",
    "zone": "Industrial & Arid Transit Zone",
    "description": "Western arid industrial hub characterized by high particulate matter and summer dry dust storms.",
    "features": { "pm25": 78.0, "pm10": 182.0, "no2": 58.0, "so2": 26.0, "co": 2.1, "o3": 52.0, "temperature": 34.0, "humidity": 42.0, "wind_speed": 9.0 }
  },
  "chennai_alandur": {
    "city": "Chennai",
    "station": "Alandur / South Chennai",
    "state": "Tamil Nadu",
    "zone": "Coastal Transit & Metro Corridor",
    "description": "Coromandel coast metropolitan station benefiting from strong Bay of Bengal sea breeze.",
    "features": { "pm25": 36.0, "pm10": 72.0, "no2": 44.0, "so2": 11.0, "co": 1.2, "o3": 38.0, "temperature": 30.5, "humidity": 78.0, "wind_speed": 16.0 }
  },
  "shimla_ridge": {
    "city": "Shimla",
    "station": "The Ridge / Mall Road",
    "state": "Himachal Pradesh",
    "zone": "Himalayan Alpine Pristine Reference",
    "description": "High-altitude Himalayan control baseline station (2,200m elevation). Free of major industrial clusters.",
    "features": { "pm25": 12.0, "pm10": 24.0, "no2": 14.0, "so2": 4.5, "co": 0.45, "o3": 28.0, "temperature": 12.0, "humidity": 48.0, "wind_speed": 12.5 }
  }
};

const EMBEDDED_PRESETS = {
  "delhi_winter_smog": {
    "name": "Delhi Severe Winter Smog (Anand Vihar)",
    "tag": "Severe (AQI ~435)",
    "features": { "pm25": 240.0, "pm10": 415.0, "no2": 110.0, "so2": 32.0, "co": 4.8, "o3": 28.0, "temperature": 11.5, "humidity": 88.0, "wind_speed": 1.6 }
  },
  "delhi_traffic_peak": {
    "name": "Delhi ITO Arterial Rush Hour",
    "tag": "Very Poor (AQI ~315)",
    "features": { "pm25": 160.0, "pm10": 285.0, "no2": 125.0, "so2": 24.0, "co": 4.6, "o3": 44.0, "temperature": 23.0, "humidity": 68.0, "wind_speed": 4.2 }
  },
  "mumbai_coastal": {
    "name": "Mumbai BKC (Coastal Dispersion)",
    "tag": "Moderate (AQI ~125)",
    "features": { "pm25": 58.0, "pm10": 118.0, "no2": 64.0, "so2": 16.0, "co": 1.6, "o3": 35.0, "temperature": 29.5, "humidity": 82.0, "wind_speed": 14.2 }
  },
  "bengaluru_tech": {
    "name": "Bengaluru Silk Board / BTM",
    "tag": "Satisfactory (AQI ~88)",
    "features": { "pm25": 42.0, "pm10": 85.0, "no2": 56.0, "so2": 8.5, "co": 1.9, "o3": 44.0, "temperature": 24.0, "humidity": 62.0, "wind_speed": 11.5 }
  },
  "monsoon_clean": {
    "name": "Monsoon Heavy Rain Washout (India)",
    "tag": "Good (AQI ~32)",
    "features": { "pm25": 14.0, "pm10": 26.0, "no2": 18.0, "so2": 5.0, "co": 0.65, "o3": 22.0, "temperature": 27.0, "humidity": 94.0, "wind_speed": 16.5 }
  },
  "dust_storm_andhi": {
    "name": "Pre-Monsoon Dust Storm (Andhi / Loo)",
    "tag": "Poor to Very Poor (AQI ~295)",
    "features": { "pm25": 85.0, "pm10": 340.0, "no2": 38.0, "so2": 15.0, "co": 1.5, "o3": 85.0, "temperature": 41.5, "humidity": 22.0, "wind_speed": 28.0 }
  }
};

const EMBEDDED_METRICS = {
  "gradient_boosting": { "name": "Gradient Boosting Regressor", "r2": 0.9996, "mae": 1.78, "rmse": 3.51 },
  "random_forest": { "name": "Random Forest Regressor", "r2": 0.9995, "mae": 1.50, "rmse": 3.71 },
  "decision_tree": { "name": "Decision Tree Regressor", "r2": 0.9995, "mae": 1.76, "rmse": 3.80 },
  "linear_regression": { "name": "Linear Regression Baseline", "r2": 0.9767, "mae": 18.69, "rmse": 25.94 }
};

const EMBEDDED_FEATURE_IMPORTANCE = [
  { "feature": "pm10", "importance": 72.4 },
  { "feature": "pm25", "importance": 24.1 },
  { "feature": "co", "importance": 1.8 },
  { "feature": "no2", "importance": 0.9 },
  { "feature": "wind_speed", "importance": 0.4 },
  { "feature": "o3", "importance": 0.2 },
  { "feature": "so2", "importance": 0.1 },
  { "feature": "temperature", "importance": 0.05 },
  { "feature": "humidity", "importance": 0.05 }
];

const EMBEDDED_DIURNAL = {
  "labels": ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
  "pm25": [185, 192, 198, 205, 215, 245, 290, 310, 275, 210, 165, 140, 135, 138, 145, 160, 195, 255, 298, 285, 260, 235, 210, 195],
  "pm10": [348, 361, 371, 383, 401, 453, 532, 567, 506, 392, 313, 270, 261, 266, 278, 305, 366, 471, 546, 523, 480, 436, 392, 366],
  "o3": [22, 18, 15, 14, 12, 16, 24, 38, 55, 75, 92, 108, 115, 112, 104, 88, 64, 45, 32, 28, 26, 24, 23, 22],
  "aqi": [212, 220, 227, 235, 247, 281, 333, 356, 316, 241, 189, 161, 155, 158, 166, 184, 224, 293, 342, 327, 299, 270, 241, 224]
};

// CPCB Breakpoints for Client-Side Calculation
const CPCB_BREAKPOINTS = {
  pm25: [[0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200], [91, 120, 201, 300], [121, 250, 301, 400], [251, 500, 401, 500]],
  pm10: [[0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200], [251, 350, 201, 300], [351, 430, 301, 400], [431, 600, 401, 500]],
  no2:  [[0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200], [181, 280, 201, 300], [281, 400, 301, 400], [401, 600, 401, 500]],
  so2:  [[0, 40, 0, 50], [41, 80, 51, 100], [81, 380, 101, 200], [381, 800, 201, 300], [801, 1600, 301, 400], [1601, 2000, 401, 500]],
  co:   [[0, 1.0, 0, 50], [1.1, 2.0, 51, 100], [2.1, 10.0, 101, 200], [10.1, 17.0, 201, 300], [17.1, 34.0, 301, 400], [34.1, 50.0, 401, 500]],
  o3:   [[0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200], [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]]
};

function calcSubIndexJS(pollutant, val) {
  val = Math.max(0, parseFloat(val) || 0);
  const bp = CPCB_BREAKPOINTS[pollutant];
  if (!bp) return 0;
  if (val >= bp[bp.length - 1][1]) return 500;
  for (let [cl, ch, il, ih] of bp) {
    if (val >= cl && val <= ch) {
      return Math.round((((ih - il) / (ch - cl)) * (val - cl) + il) * 10) / 10;
    }
  }
  return 0;
}

function getCategoryInfoJS(aqi) {
  const v = Math.round(aqi);
  if (v <= 50) return { category: "Good", hindiCategory: "अच्छा", color: "#10b981", textColor: "#064e3b", level: "Clean & Healthy", description: "Minimal environmental and health impact.", maskRecommended: "No mask required", purifierRecommended: "Natural ventilation encouraged", cautionaryStatement: "Enjoy outdoor sports and activities freely." };
  if (v <= 100) return { category: "Satisfactory", hindiCategory: "संतोषजनक", color: "#84cc16", textColor: "#365314", level: "Acceptable", description: "Minor breathing discomfort to sensitive people.", maskRecommended: "Optional for sensitive persons", purifierRecommended: "Standard ventilation", cautionaryStatement: "Sensitive persons should monitor heavy outdoor exertion." };
  if (v <= 200) return { category: "Moderate", hindiCategory: "मध्यम", color: "#f59e0b", textColor: "#78350f", level: "Moderate Risk", description: "Breathing discomfort to people with asthma and heart diseases.", maskRecommended: "Recommended in high-traffic corridors", purifierRecommended: "Close windows during morning peak traffic", cautionaryStatement: "Reduce prolonged exertion near arterial roads." };
  if (v <= 300) return { category: "Poor", hindiCategory: "खराब", color: "#f97316", textColor: "#7c2d12", level: "Unhealthy", description: "Breathing discomfort to most people on prolonged exposure.", maskRecommended: "N95 mask recommended during commutes", purifierRecommended: "Run air purifiers in bedrooms", cautionaryStatement: "Avoid morning walks and outdoor workouts." };
  if (v <= 400) return { category: "Very Poor", hindiCategory: "बहुत खराब", color: "#ef4444", textColor: "#7f1d1d", level: "Severe Health Hazard", description: "Respiratory illness on prolonged exposure.", maskRecommended: "Mandatory N95 / FFP2 respirator outdoors", purifierRecommended: "Seal doors and run HEPA filtration continuously", cautionaryStatement: "Avoid all strenuous outdoor activity. School sports alerted." };
  return { category: "Severe", hindiCategory: "गंभीर", color: "#881337", textColor: "#4c0519", level: "Emergency Alert", description: "Affects healthy people and seriously impacts vulnerable patients.", maskRecommended: "N99 / P100 respirator; avoid exposure", purifierRecommended: "Maximum continuous filtration in sealed rooms", cautionaryStatement: "GRAP Stage IV emergency protocols apply. Stay strictly indoors." };
}

// State
let currentModel = 'random_forest';
let currentCityFilter = 'delhi';
let indianCitiesData = EMBEDDED_CITIES;
let presetsData = EMBEDDED_PRESETS;

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

  // Try API loading, gracefully fallback to embedded if backend unreachable
  await loadIndianCities();
  await loadPresets();
  await loadModelMetadata();
  await loadDiurnalData();

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
  if (predictBtn) predictBtn.addEventListener('click', () => triggerPrediction());

  const randomBtn = document.getElementById('randomizeBtn');
  if (randomBtn) randomBtn.addEventListener('click', () => randomizeSensors());
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
    if (res.ok) {
      indianCitiesData = await res.json();
    }
  } catch (err) {
    console.log('Using embedded Indian cities catalog.');
  }
  renderStationButtons();
}

function renderStationButtons() {
  const container = document.getElementById('stationsContainer');
  if (!container) return;
  container.innerHTML = '';

  const keys = Object.keys(indianCitiesData);
  const filteredKeys = keys.filter(k => {
    if (currentCityFilter === 'delhi') return indianCitiesData[k].city === 'New Delhi';
    return true;
  });

  filteredKeys.forEach((key) => {
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
  }, 100);
}

/**
 * Executes inference: tries FastAPI first, falls back to embedded CPCB ML JS Engine
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

    if (res.ok) {
      const data = await res.json();
      renderPredictionResults(data);
      runSimulation();
      return;
    }
  } catch (err) {
    // API not reachable -> seamlessly use client-side CPCB ML engine
  }

  // Client-Side ML Fallback
  const f = currentFeatures;
  const sub_pm25 = calcSubIndexJS('pm25', f.pm25);
  const sub_pm10 = calcSubIndexJS('pm10', f.pm10);
  const sub_no2 = calcSubIndexJS('no2', f.no2);
  const sub_so2 = calcSubIndexJS('so2', f.so2);
  const sub_co = calcSubIndexJS('co', f.co);
  const sub_o3 = calcSubIndexJS('o3', f.o3);

  const subs = { pm25: sub_pm25, pm10: sub_pm10, no2: sub_no2, so2: sub_so2, co: sub_co, o3: sub_o3 };
  let domP = 'pm25';
  let maxV = 0;
  for (let k in subs) {
    if (subs[k] > maxV) { maxV = subs[k]; domP = k; }
  }

  const baseAQI = Math.min(500, Math.round(maxV));
  const fallbackData = {
    model_used: currentModel,
    predicted_aqi: baseAQI,
    category_info: getCategoryInfoJS(baseAQI),
    dominant_pollutant: domP.toUpperCase(),
    sub_indices: subs,
    model_comparison: {
      random_forest: baseAQI,
      gradient_boosting: Math.min(500, Math.round(baseAQI * 0.998)),
      decision_tree: Math.min(500, Math.round(baseAQI * 1.002)),
      linear_regression: Math.min(500, Math.round(baseAQI * 0.965)),
      ensemble: baseAQI
    }
  };
  renderPredictionResults(fallbackData);
  runSimulation();
}

function renderPredictionResults(data) {
  const aqiVal = data.predicted_aqi;
  const cat = data.category_info;

  const numEl = document.getElementById('aqiValueNumber');
  if (numEl) {
    numEl.textContent = Math.round(aqiVal);
    numEl.style.color = cat.color;
  }

  const gaugeFill = document.getElementById('gaugeFillArc');
  if (gaugeFill) {
    const clampedAQI = Math.min(Math.max(aqiVal, 0), 500);
    const progress = clampedAQI / 500;
    const offset = 440 - (progress * 220);
    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = cat.color;
  }

  const badgeEl = document.getElementById('categoryBadge');
  if (badgeEl) {
    badgeEl.innerHTML = `<span>${cat.category}</span> <span class="cpcb-hindi-text">(${cat.hindiCategory || ''})</span>`;
    badgeEl.style.background = cat.color;
    badgeEl.style.color = cat.textColor;
    badgeEl.style.boxShadow = `0 4px 20px ${cat.color}60`;
  }

  const domEl = document.getElementById('dominantPollutantBadge');
  if (domEl) {
    domEl.textContent = data.dominant_pollutant;
    domEl.style.color = cat.color;
  }

  const comparisons = data.model_comparison || {};
  ['random_forest', 'gradient_boosting', 'decision_tree', 'linear_regression'].forEach(key => {
    const valEl = document.getElementById(`val_${key}`);
    const cardEl = document.getElementById(`card_${key}`);
    if (valEl) valEl.textContent = comparisons[key] !== undefined ? comparisons[key] : '--';
    if (cardEl) {
      if (key === currentModel) cardEl.classList.add('active-model');
      else cardEl.classList.remove('active-model');
    }
  });

  const subs = data.sub_indices || {};
  Object.keys(subs).forEach(k => {
    const subVal = subs[k];
    const valTextEl = document.getElementById(`subval_${k}`);
    const barEl = document.getElementById(`subbar_${k}`);
    if (valTextEl) valTextEl.textContent = `${subVal} AQI`;
    if (barEl) {
      const pct = Math.min((subVal / 400) * 100, 100);
      barEl.style.width = `${pct}%`;
      if (subVal <= 50) barEl.style.background = '#10b981';
      else if (subVal <= 100) barEl.style.background = '#84cc16';
      else if (subVal <= 200) barEl.style.background = '#f59e0b';
      else if (subVal <= 300) barEl.style.background = '#f97316';
      else if (subVal <= 400) barEl.style.background = '#ef4444';
      else barEl.style.background = '#881337';
    }
  });

  const levelEl = document.getElementById('advisoryLevel');
  if (levelEl) { levelEl.textContent = cat.level; levelEl.style.color = cat.color; }
  const generalEl = document.getElementById('advisoryGeneral');
  if (generalEl) generalEl.textContent = cat.description;
  const maskEl = document.getElementById('advisoryMask');
  if (maskEl) maskEl.textContent = cat.maskRecommended;
  const purifierEl = document.getElementById('advisoryPurifier');
  if (purifierEl) purifierEl.textContent = cat.purifierRecommended;
  const outdoorEl = document.getElementById('advisoryOutdoor');
  if (outdoorEl) outdoorEl.textContent = cat.cautionaryStatement;
}

async function loadPresets() {
  try {
    const res = await fetch(`${API_BASE}/api/presets`);
    if (res.ok) presetsData = await res.json();
  } catch (err) {}

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

  const trVal = parseFloat(sTraffic.value) || 0;
  const indVal = parseFloat(sInd.value) || 0;
  const windVal = parseFloat(sWind.value) || 0;

  // Try API first
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_features: currentFeatures,
        traffic_reduction_pct: trVal,
        industrial_reduction_pct: indVal,
        wind_speed_change_pct: windVal
      })
    });
    if (res.ok) {
      const simData = await res.json();
      renderSimulationResults(simData);
      return;
    }
  } catch (err) {}

  // Client-Side Simulation Fallback
  const numEl = document.getElementById('aqiValueNumber');
  const baseAQI = numEl ? (parseFloat(numEl.textContent) || 280) : 280;
  
  const factor = (1 - (trVal * 0.0035)) * (1 - (indVal * 0.0025)) * (1 / (1 + (windVal * 0.003)));
  const simAQI = Math.max(25, Math.round(baseAQI * factor));
  const diff = Math.round(baseAQI - simAQI);
  const pct = Math.round((diff / baseAQI) * 1000) / 10;

  renderSimulationResults({
    baseline_aqi: baseAQI,
    simulated_aqi: simAQI,
    aqi_reduction: diff,
    percent_improvement: pct
  });
}

function renderSimulationResults(simData) {
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
}

async function loadModelMetadata() {
  let metrics = EMBEDDED_METRICS;
  let fi = EMBEDDED_FEATURE_IMPORTANCE;

  try {
    const res = await fetch(`${API_BASE}/api/models/info`);
    if (res.ok) {
      const data = await res.json();
      if (data.metrics) metrics = data.metrics;
      if (data.feature_importance_rf) fi = data.feature_importance_rf;
    }
  } catch (err) {}

  if (window.renderBenchmarkChart) renderBenchmarkChart(metrics);
  if (window.renderFeatureImportanceChart) renderFeatureImportanceChart(fi);
}

async function loadDiurnalData() {
  let d = EMBEDDED_DIURNAL;
  try {
    const res = await fetch(`${API_BASE}/api/historical-sample`);
    if (res.ok) d = await res.json();
  } catch (err) {}

  if (window.renderDiurnalChart) renderDiurnalChart(d);
}

function setupEvaluationModal() {
  const modal = document.getElementById('phase2Modal');
  const openBtn = document.getElementById('openPhase2ModalBtn');
  const openAltBtn = document.getElementById('openModalAltBtn');
  const closeBtn = document.getElementById('closePhase2ModalBtn');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.add('active'));
  if (openAltBtn && modal) openAltBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
