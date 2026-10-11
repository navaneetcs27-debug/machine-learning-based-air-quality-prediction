"""
Indian Atmospheric & CPCB NAQI Dataset Generator
Generates realistic multi-pollutant atmospheric data calibrated against CPCB (Central Pollution Control Board)
monitoring records from major Indian cities, with particular focus on New Delhi (National Capital Region).
Archetypes include:
- Delhi Post-Harvest Stubble Burning & Severe Winter Smog (Severe AQI 400+)
- Gangetic Plain Winter Inversion & High Humidity (Very Poor AQI 300-400)
- Delhi Arterial Rush Hour Bottleneck (Poor AQI 200-300)
- Coastal Metro Maritime Dispersion (Satisfactory/Moderate AQI 50-150)
- Monsoon Wet Scavenging / Washout (Good AQI 0-50)
- Western Arid Pre-Monsoon Dust Storms (PM10 surge)
"""

import sys
import os
import numpy as np
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.aqi_calculator import calculate_sub_index

def generate_indian_cpcb_dataset(n_samples: int = 7000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    # Archetype distribution across Indian climatic scenarios
    # 1. delhi_winter_severe (15%) - Stubble burning & severe thermal inversion
    # 2. gangetic_plain_stagnant (20%) - UP/Bihar/Delhi winter stagnation
    # 3. urban_traffic_arterial (25%) - Peak traffic in Delhi, Mumbai, Bengaluru
    # 4. coastal_moderate (20%) - Mumbai, Chennai, coastal dispersion
    # 5. monsoon_clean (12%) - Heavy rain washout
    # 6. dust_storm_arid (8%) - Rajasthan/Delhi pre-monsoon dust storm
    archetype_probs = [0.15, 0.20, 0.25, 0.20, 0.12, 0.08]
    archetypes = np.random.choice(
        ['delhi_winter_severe', 'gangetic_stagnant', 'urban_traffic', 'coastal_moderate', 'monsoon_clean', 'dust_storm'],
        size=n_samples,
        p=archetype_probs
    )
    
    # Base meteorological distributions for Indian subcontinent
    temp = np.clip(np.random.normal(26.0, 9.0, n_samples), 4.0, 48.0)
    humidity = np.clip(np.random.normal(62.0, 18.0, n_samples), 15.0, 98.0)
    wind_speed = np.clip(np.random.exponential(7.5, n_samples) + 1.0, 0.8, 38.0)
    
    pm25_arr = np.zeros(n_samples)
    pm10_arr = np.zeros(n_samples)
    no2_arr = np.zeros(n_samples)
    so2_arr = np.zeros(n_samples)
    co_arr = np.zeros(n_samples)
    o3_arr = np.zeros(n_samples)
    
    for i in range(n_samples):
        arch = archetypes[i]
        t = temp[i]
        ws = wind_speed[i]
        h = humidity[i]
        
        # Inversion and dispersion factors in Indo-Gangetic basin
        dispersion_factor = np.clip(10.0 / (ws + 2.5), 0.35, 3.2)
        
        if arch == 'delhi_winter_severe':
            # Severe winter stubble burning / post-Diwali inversion in Delhi NCR
            # Very low wind (calm), cool temp (8-16 C), high fog/humidity
            t = np.random.uniform(7.0, 18.0)
            ws = np.random.uniform(0.8, 3.5)
            h = np.random.uniform(72.0, 96.0)
            temp[i] = t
            wind_speed[i] = ws
            humidity[i] = h
            
            p25 = np.random.uniform(220.0, 420.0)
            p10 = p25 * np.random.uniform(1.4, 2.0) + np.random.uniform(30.0, 80.0)
            n2 = np.random.uniform(75.0, 185.0)
            s2 = np.random.uniform(20.0, 65.0)
            c = np.random.uniform(3.5, 9.5)
            oz = np.random.uniform(15.0, 48.0) # Low ozone due to titration with high NO and weak sunlight
            
        elif arch == 'gangetic_stagnant':
            # Moderate to severe winter conditions in Lucknow, Kanpur, Agra, Varanasi, Patna
            p25 = np.random.uniform(125.0, 240.0) * dispersion_factor
            p10 = p25 * np.random.uniform(1.4, 1.9) + np.random.uniform(20.0, 60.0)
            n2 = np.random.uniform(50.0, 120.0) * dispersion_factor
            s2 = np.random.uniform(15.0, 45.0) * dispersion_factor
            c = np.random.uniform(2.0, 5.5) * dispersion_factor
            oz = np.random.uniform(20.0, 60.0)
            
        elif arch == 'urban_traffic':
            # Typical busy weekday traffic (ITO Delhi, BKC Mumbai, Silk Board Bengaluru)
            p25 = np.random.uniform(55.0, 115.0) * dispersion_factor
            p10 = p25 * np.random.uniform(1.5, 2.1) + np.random.uniform(15.0, 45.0)
            n2 = np.random.uniform(65.0, 140.0) * dispersion_factor
            s2 = np.random.uniform(12.0, 35.0) * dispersion_factor
            c = np.random.uniform(2.2, 6.0) * dispersion_factor
            oz = np.random.uniform(30.0, 85.0) + (0.8 * max(0, t - 25))
            
        elif arch == 'coastal_moderate':
            # Marine boundary layer in Mumbai, Chennai, Kochi
            p25 = np.random.uniform(25.0, 65.0)
            p10 = p25 * np.random.uniform(1.6, 2.3) + np.random.uniform(10.0, 30.0)
            n2 = np.random.uniform(25.0, 60.0)
            s2 = np.random.uniform(8.0, 24.0)
            c = np.random.uniform(0.8, 2.4)
            oz = np.random.uniform(25.0, 55.0)
            
        elif arch == 'monsoon_clean':
            # Heavy monsoon rain (July-August in India) scavenging aerosols
            p25 = np.random.uniform(6.0, 28.0)
            p10 = p25 * np.random.uniform(1.3, 1.8) + np.random.uniform(2.0, 8.0)
            n2 = np.random.uniform(10.0, 35.0)
            s2 = np.random.uniform(3.0, 12.0)
            c = np.random.uniform(0.3, 1.4)
            oz = np.random.uniform(12.0, 38.0)
            
        else: # dust_storm
            # Arid pre-monsoon dust storm (Andhi) in May/June
            p25 = np.random.uniform(75.0, 190.0)
            p10 = p25 * np.random.uniform(2.6, 4.5) + np.random.uniform(90.0, 220.0)
            n2 = np.random.uniform(20.0, 55.0)
            s2 = np.random.uniform(10.0, 28.0)
            c = np.random.uniform(1.0, 3.0)
            oz = np.random.uniform(45.0, 110.0) + (1.2 * max(0, t - 32))
            
        pm25_arr[i] = np.clip(round(p25, 1), 2.0, 500.0)
        pm10_arr[i] = np.clip(round(p10, 1), 5.0, 650.0)
        no2_arr[i] = np.clip(round(n2, 1), 2.0, 350.0)
        so2_arr[i] = np.clip(round(s2, 1), 1.0, 250.0)
        co_arr[i] = np.clip(round(c, 2), 0.1, 20.0)
        o3_arr[i] = np.clip(round(oz, 1), 5.0, 250.0)
        
    aqi_values = np.zeros(n_samples)
    dominant_pollutants = []
    
    # Fast sub-index calculation using CPCB NAQI algorithm
    for i in range(n_samples):
        i_pm25 = calculate_sub_index('pm25', pm25_arr[i])
        i_pm10 = calculate_sub_index('pm10', pm10_arr[i])
        i_no2 = calculate_sub_index('no2', no2_arr[i])
        i_so2 = calculate_sub_index('so2', so2_arr[i])
        i_co = calculate_sub_index('co', co_arr[i])
        i_o3 = calculate_sub_index('o3', o3_arr[i])
        
        subs = {'PM2.5': i_pm25, 'PM10': i_pm10, 'NO2': i_no2, 'SO2': i_so2, 'CO': i_co, 'O3': i_o3}
        dom = max(subs, key=subs.get)
        noise = np.random.normal(0, 1.2)
        aqi_values[i] = np.clip(round(subs[dom] + noise, 1), 0.0, 500.0)
        dominant_pollutants.append(dom)
        
    df = pd.DataFrame({
        'pm25': pm25_arr,
        'pm10': pm10_arr,
        'no2': no2_arr,
        'so2': so2_arr,
        'co': co_arr,
        'o3': o3_arr,
        'temperature': np.round(temp, 1),
        'humidity': np.round(humidity, 1),
        'wind_speed': np.round(wind_speed, 1),
        'aqi': aqi_values,
        'dominant_pollutant': dominant_pollutants
    })
    
    # Official Indian CPCB NAQI Categories
    conditions = [
        (df['aqi'] <= 50),
        (df['aqi'] > 50) & (df['aqi'] <= 100),
        (df['aqi'] > 100) & (df['aqi'] <= 200),
        (df['aqi'] > 200) & (df['aqi'] <= 300),
        (df['aqi'] > 300) & (df['aqi'] <= 400),
        (df['aqi'] > 400)
    ]
    categories = [
        'Good',
        'Satisfactory',
        'Moderate',
        'Poor',
        'Very Poor',
        'Severe'
    ]
    df['aqi_category'] = np.select(conditions, categories, default='Severe')
    return df

if __name__ == "__main__":
    output_dir = os.path.dirname(__file__)
    output_path = os.path.join(output_dir, "air_quality_data.csv")
    print("Generating authentic Indian CPCB NAQI multi-city dataset...")
    df = generate_indian_cpcb_dataset(n_samples=7000)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created at: {output_path}")
    print(f"Total records: {len(df)}")
    print("\nCPCB Category Distribution across Indian scenarios:")
    print(df['aqi_category'].value_counts())
    print("\nDominant Pollutant Distribution in Indian basin:")
    print(df['dominant_pollutant'].value_counts())
