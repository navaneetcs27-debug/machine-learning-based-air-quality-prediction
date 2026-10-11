"""
Indian Cities and Delhi CAAQM Station Registry
Provides authentic historical profiles, geographic metadata, CAAQM monitoring station parameters,
and seasonal meteorological distributions formulated as per CPCB (Central Pollution Control Board) records.
"""

INDIAN_CITIES_REGISTRY = {
    # =========================================================================
    # NATIONAL CAPITAL REGION: NEW DELHI (PRIMARY CORE BENCHMARK)
    # =========================================================================
    "delhi_anand_vihar": {
        "city": "New Delhi",
        "station": "Anand Vihar (Trans-Yamuna)",
        "state": "Delhi NCR",
        "zone": "Critical Emission Hotspot (ISBT + Industrial Corridor)",
        "coordinates": {"lat": 28.6469, "lon": 77.3160},
        "description": "Consistently one of India's most critical CAAQM stations. Impacted by heavy interstate bus transit (ISBT), cross-border freight traffic, and unpaved particulate resuspension.",
        "seasonalTrend": "Catastrophic winter spikes during Oct-Jan stubble burning and temperature inversion.",
        "features": {
            "pm25": 215.0,
            "pm10": 385.0,
            "no2": 95.0,
            "so2": 28.0,
            "co": 3.8,
            "o3": 42.0,
            "temperature": 18.5,
            "humidity": 78.0,
            "wind_speed": 3.2
        }
    },
    "delhi_ito": {
        "city": "New Delhi",
        "station": "ITO Crossing (Central Delhi)",
        "state": "Delhi NCR",
        "zone": "Major Traffic Arterial Bottleneck",
        "coordinates": {"lat": 28.6297, "lon": 77.2415},
        "description": "High-density governmental and commercial intersection with chronic vehicular congestion, idling exhaust, and high NO2 and CO concentrations.",
        "seasonalTrend": "Elevated weekday rush hour spikes; severe nighttime inversion trapping.",
        "features": {
            "pm25": 165.0,
            "pm10": 290.0,
            "no2": 112.0,
            "so2": 22.0,
            "co": 4.5,
            "o3": 38.0,
            "temperature": 21.0,
            "humidity": 68.0,
            "wind_speed": 4.5
        }
    },
    "delhi_rk_puram": {
        "city": "New Delhi",
        "station": "R.K. Puram (South Delhi)",
        "state": "Delhi NCR",
        "zone": "Mixed Residential & Ring Road",
        "coordinates": {"lat": 28.5638, "lon": 77.1867},
        "description": "Prominent South Delhi urban residential sector adjacent to the Inner Ring Road; primary indicator for residential population exposure.",
        "seasonalTrend": "Moderate in monsoon (40-60 AQI); escalates to 'Very Poor' in November-December.",
        "features": {
            "pm25": 142.0,
            "pm10": 255.0,
            "no2": 78.0,
            "so2": 18.5,
            "co": 2.9,
            "o3": 48.0,
            "temperature": 22.5,
            "humidity": 65.0,
            "wind_speed": 5.8
        }
    },
    "delhi_punjabi_bagh": {
        "city": "New Delhi",
        "station": "Punjabi Bagh (West Delhi)",
        "state": "Delhi NCR",
        "zone": "Dense Commercial & Ring Road Corridor",
        "coordinates": {"lat": 28.6740, "lon": 77.1310},
        "description": "West Delhi transport corridor connecting Outer Ring Road and Rohtak Road. High diesel vehicle transit and commercial market emissions.",
        "seasonalTrend": "High PM2.5 and PM10 during early mornings and late evenings.",
        "features": {
            "pm25": 178.0,
            "pm10": 310.0,
            "no2": 88.0,
            "so2": 24.0,
            "co": 3.4,
            "o3": 44.0,
            "temperature": 20.0,
            "humidity": 72.0,
            "wind_speed": 4.0
        }
    },
    "delhi_rohini": {
        "city": "New Delhi",
        "station": "Rohini / Sector 16 (North-West Delhi)",
        "state": "Delhi NCR",
        "zone": "North-West Urban & Agro-Industrial Border",
        "coordinates": {"lat": 28.7325, "lon": 77.1188},
        "description": "Receives incoming northwesterly winds carrying seasonal agricultural stubble smoke from Punjab and Haryana during October-November.",
        "seasonalTrend": "Severe surges in post-monsoon harvest window.",
        "features": {
            "pm25": 195.0,
            "pm10": 345.0,
            "no2": 82.0,
            "so2": 26.0,
            "co": 3.6,
            "o3": 36.0,
            "temperature": 19.5,
            "humidity": 74.0,
            "wind_speed": 3.8
        }
    },
    "delhi_lodhi_road": {
        "city": "New Delhi",
        "station": "Lodhi Road (IMD Headquarters)",
        "state": "Delhi NCR",
        "zone": "Green Institutional Corridor",
        "coordinates": {"lat": 28.5918, "lon": 77.2273},
        "description": "Surrounded by urban green foliage and parks (Lodhi Gardens, Golf Course). Operates as the cleaner reference baseline for Delhi.",
        "seasonalTrend": "Relatively cleaner than industrial and highway stations, yet exceeds national standards in winter.",
        "features": {
            "pm25": 88.0,
            "pm10": 165.0,
            "no2": 52.0,
            "so2": 14.0,
            "co": 1.8,
            "o3": 54.0,
            "temperature": 24.0,
            "humidity": 58.0,
            "wind_speed": 7.5
        }
    },

    # =========================================================================
    # MAJOR INDIAN METROS & REGIONAL BENCHMARKS
    # =========================================================================
    "mumbai_bkc": {
        "city": "Mumbai",
        "station": "Bandra Kurla Complex (BKC)",
        "state": "Maharashtra",
        "zone": "Commercial CBD & Coastal Plain",
        "coordinates": {"lat": 19.0657, "lon": 72.8687},
        "description": "Financial business district influenced by coastal sea-breeze dispersion and high year-round relative humidity.",
        "seasonalTrend": "Moderate air quality moderated by maritime winds; episodic winter smog when wind reverses inland.",
        "features": {
            "pm25": 58.0,
            "pm10": 118.0,
            "no2": 64.0,
            "so2": 16.0,
            "co": 1.6,
            "o3": 35.0,
            "temperature": 29.5,
            "humidity": 82.0,
            "wind_speed": 14.2
        }
    },
    "bengaluru_btm": {
        "city": "Bengaluru",
        "station": "BTM Layout / Silk Board",
        "state": "Karnataka",
        "zone": "IT Corridor & Ring Road Junction",
        "coordinates": {"lat": 12.9166, "lon": 77.6101},
        "description": "High tech-commuter corridor on the Deccan Plateau (920m elevation). Air quality is governed primarily by traffic emissions rather than industrial smoke.",
        "seasonalTrend": "Generally 'Satisfactory' to 'Moderate' due to favorable plateau ventilation.",
        "features": {
            "pm25": 42.0,
            "pm10": 85.0,
            "no2": 56.0,
            "so2": 8.5,
            "co": 1.9,
            "o3": 44.0,
            "temperature": 24.0,
            "humidity": 62.0,
            "wind_speed": 11.5
        }
    },
    "kolkata_rabindra": {
        "city": "Kolkata",
        "station": "Rabindra Bharati University",
        "state": "West Bengal",
        "zone": "North Kolkata Dense Urban Corridor",
        "coordinates": {"lat": 22.6272, "lon": 88.3812},
        "description": "Lower Gangetic delta location with high population density, heavy diesel transit, and nocturnal river valley inversion.",
        "seasonalTrend": "Clean in monsoon; severe deterioration to 'Poor' and 'Very Poor' in Dec-Jan winter inversion.",
        "features": {
            "pm25": 118.0,
            "pm10": 215.0,
            "no2": 72.0,
            "so2": 21.0,
            "co": 2.4,
            "o3": 32.0,
            "temperature": 23.0,
            "humidity": 76.0,
            "wind_speed": 5.2
        }
    },
    "lucknow_talkatora": {
        "city": "Lucknow",
        "station": "Talkatora Industrial Area",
        "state": "Uttar Pradesh",
        "zone": "Indo-Gangetic Plain Industrial Zone",
        "coordinates": {"lat": 26.8304, "lon": 80.9014},
        "description": "Situated in the central fertile Gangetic belt. Suffers from low winter planetary boundary layer height and heavy localized industrial combustion.",
        "seasonalTrend": "Prolonged winter fog-smog entrapment causing sustained 'Very Poor' AQI.",
        "features": {
            "pm25": 158.0,
            "pm10": 275.0,
            "no2": 68.0,
            "so2": 32.0,
            "co": 3.1,
            "o3": 38.0,
            "temperature": 19.0,
            "humidity": 80.0,
            "wind_speed": 3.5
        }
    },
    "ahmedabad_maninagar": {
        "city": "Ahmedabad",
        "station": "Maninagar / South Ahmedabad",
        "state": "Gujarat",
        "zone": "Industrial & Arid Transit Zone",
        "coordinates": {"lat": 22.9978, "lon": 72.6033},
        "description": "Western arid industrial hub characterized by high particulate matter, summer dry dust storms, and chemical industrial emissions.",
        "seasonalTrend": "Elevated coarse PM10 during arid pre-monsoon heat waves (Loo winds).",
        "features": {
            "pm25": 78.0,
            "pm10": 182.0,
            "no2": 58.0,
            "so2": 26.0,
            "co": 2.1,
            "o3": 52.0,
            "temperature": 34.0,
            "humidity": 42.0,
            "wind_speed": 9.0
        }
    },
    "chennai_alandur": {
        "city": "Chennai",
        "station": "Alandur / South Chennai",
        "state": "Tamil Nadu",
        "zone": "Coastal Transit & Metro Corridor",
        "coordinates": {"lat": 13.0033, "lon": 80.2016},
        "description": "Coromandel coast metropolitan station benefiting from strong Bay of Bengal sea breeze and regular northeast monsoon showers.",
        "seasonalTrend": "Consistently in the 'Satisfactory' to low 'Moderate' range year-round.",
        "features": {
            "pm25": 36.0,
            "pm10": 72.0,
            "no2": 44.0,
            "so2": 11.0,
            "co": 1.2,
            "o3": 38.0,
            "temperature": 30.5,
            "humidity": 78.0,
            "wind_speed": 16.0
        }
    },
    "shimla_ridge": {
        "city": "Shimla",
        "station": "The Ridge / Mall Road",
        "state": "Himachal Pradesh",
        "zone": "Himalayan Alpine Pristine Reference",
        "coordinates": {"lat": 31.1048, "lon": 77.1734},
        "description": "High-altitude Himalayan control baseline station (2,200m elevation). Free of major industrial clusters, with minimal vehicular exhaust.",
        "seasonalTrend": "Pristine 'Good' AQI throughout the year except occasional forest fire smoke in late spring.",
        "features": {
            "pm25": 12.0,
            "pm10": 24.0,
            "no2": 14.0,
            "so2": 4.5,
            "co": 0.45,
            "o3": 28.0,
            "temperature": 12.0,
            "humidity": 48.0,
            "wind_speed": 12.5
        }
    }
}
