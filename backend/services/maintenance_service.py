from collections import deque
from datetime import datetime

recent_results = deque(maxlen=10)

def evaluate_maintenance(ai_result):
    prediction = ai_result.get("prediction", "UNAVAILABLE")
    risk_level = ai_result.get("risk_level", "UNKNOWN")
    anomaly_score = ai_result.get("anomaly_score")
    recent_results.append({"prediction": prediction, "risk_level": risk_level, "anomaly_score": anomaly_score, "timestamp": datetime.now().isoformat()})
    anomaly_count = sum(1 for result in recent_results if result["prediction"] == "ANOMALY")
    persistent_anomaly = anomaly_count >= 3
    if prediction == "NORMAL":
        return {"maintenance_status":"NORMAL","maintenance_level":"NONE","message":"Hardware sensor behavior is within the learned normal baseline.","recommended_action":"Continue normal operation and routine monitoring.","inspection_type":"Routine inspection","reason":"Current sensor behavior is consistent with the learned normal baseline.","components_to_inspect":[],"estimated_inspection_time":"10-15 minutes","priority":"LOW","persistent_anomaly":False,"anomaly_count":anomaly_count,"observations":len(recent_results)}
    if persistent_anomaly and risk_level == "HIGH":
        status="MAINTENANCE RECOMMENDED"; level="HIGH"; message="Persistent unusual hardware behavior has been detected. A maintenance inspection is recommended."; action="Inspect the rotating assembly and verify sensor mounting and mechanical condition."; inspection="Detailed mechanical inspection"; reason="Repeated anomalous sensor behavior has been detected relative to the learned normal hardware baseline."; components=["Rotor and rotating assembly","Motor and shaft coupling","Bearings and mounting points","MPU6050 sensor mounting","MAX4466 microphone mounting"]; time="30-45 minutes"; priority="HIGH"
    elif persistent_anomaly and risk_level == "MEDIUM":
        status="MAINTENANCE RECOMMENDED"; level="MEDIUM"; message="Persistent unusual sensor behavior has been detected. Condition monitoring and maintenance inspection are recommended."; action="Inspect the rotating assembly and verify vibration and acoustic sensor readings."; inspection="Condition inspection"; reason="Repeated unusual sensor behavior has been observed compared with the learned normal hardware baseline."; components=["Rotor and rotating assembly","Motor and shaft coupling","Bearings and mounting points","MPU6050 sensor mounting","MAX4466 microphone mounting"]; time="20-30 minutes"; priority="MEDIUM"
    elif persistent_anomaly:
        status="MONITOR"; level="LOW"; message="Unusual sensor behavior is recurring. Continue monitoring the hardware condition."; action="Continue monitoring and perform a basic visual and mechanical inspection."; inspection="Basic inspection"; reason="Recurring unusual sensor behavior has been detected, but the current risk level is low."; components=["Rotor and rotating assembly","Sensor mounting points"]; time="10-15 minutes"; priority="LOW"
    else:
        status="MONITOR"; level="LOW"; message="A temporary unusual sensor reading was detected. Continue monitoring; this is not sufficient evidence of a mechanical fault."; action="Continue operation and monitor subsequent sensor observations."; inspection="Observation only"; reason="Only a temporary unusual sensor observation has been detected."; components=[]; time="5-10 minutes"; priority="LOW"
    return {"maintenance_status":status,"maintenance_level":level,"message":message,"recommended_action":action,"inspection_type":inspection,"reason":reason,"components_to_inspect":components,"estimated_inspection_time":time,"priority":priority,"persistent_anomaly":persistent_anomaly,"anomaly_count":anomaly_count,"observations":len(recent_results)}

def calculate_maintenance(prediction, risk_level, anomaly_score=None):
    return evaluate_maintenance({"prediction":prediction,"risk_level":risk_level,"anomaly_score":anomaly_score})

def get_maintenance_history():
    return list(recent_results)

def reset_maintenance_history():
    recent_results.clear()
