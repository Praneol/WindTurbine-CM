from fastapi import APIRouter, HTTPException
from datetime import datetime
from services.live_hardware_service import get_latest_hardware_data
from services.hardware_prediction_service import predict_hardware_condition
from services.maintenance_service import evaluate_maintenance
router = APIRouter(prefix="/api/alerts", tags=["Alerts"])
alert_history = []
@router.get("/latest")
def get_latest_alert():
    sensor_data = get_latest_hardware_data()
    if sensor_data is None:
        raise HTTPException(status_code=503, detail="Waiting for ESP8266 hardware data")
    hardware_ai = predict_hardware_condition(sensor_data)
    maintenance = evaluate_maintenance(hardware_ai)
    prediction = hardware_ai.get("prediction", "UNKNOWN")
    risk_level = hardware_ai.get("risk_level", "UNKNOWN")
    anomaly_score = hardware_ai.get("anomaly_score", 0)
    if prediction == "ANOMALY":
        if risk_level == "HIGH":
            severity = "CRITICAL"
        elif risk_level == "MEDIUM":
            severity = "WARNING"
        else:
            severity = "INFO"
        alert_data = {"turbine_id":"WT-001","severity":severity,"risk_level":risk_level,"anomaly_score":anomaly_score,"prediction":prediction,"message":"Unusual hardware behavior detected. Continue monitoring and inspect the rotating assembly if the condition persists.","recommended_action":maintenance.get("recommended_action","Continue monitoring."),"inspection_type":maintenance.get("inspection_type","Observation only"),"reason":maintenance.get("reason","Unusual sensor behavior detected."),"components_to_inspect":maintenance.get("components_to_inspect",[]),"estimated_inspection_time":maintenance.get("estimated_inspection_time","10-15 minutes"),"priority":maintenance.get("priority","LOW"),"timestamp":datetime.now().isoformat(),"acknowledged":False,"sensor_data":sensor_data}
        alert_history.insert(0, alert_data)
        if len(alert_history) > 100:
            alert_history.pop()
        return {"alert":True,"data":alert_data}
    return {"alert":False,"data":{"turbine_id":"WT-001","severity":"NORMAL","risk_level":risk_level,"anomaly_score":anomaly_score,"prediction":prediction,"message":"No active hardware alert. Sensor behavior is within the learned normal baseline.","timestamp":sensor_data.get("pc_timestamp",datetime.now().isoformat()),"acknowledged":True,"sensor_data":sensor_data}}
@router.get("/test-alert")
def test_alert():
    sensor_data = get_latest_hardware_data()
    if sensor_data is None:
        raise HTTPException(status_code=503, detail="Waiting for ESP8266 hardware data")
    test_data = sensor_data.copy()
    test_data["acc_magnitude"] = 25.0
    test_data["gyro_magnitude"] = 2.0
    test_data["acc_variation"] = 5.0
    test_data["sound_deviation"] = 100.0
    test_data["vibration_rolling_std"] = 5.0
    test_data["sound_rolling_std"] = 50.0
    hardware_ai = predict_hardware_condition(test_data)
    maintenance = evaluate_maintenance(hardware_ai)
    prediction = hardware_ai.get("prediction", "UNKNOWN")
    risk_level = hardware_ai.get("risk_level", "UNKNOWN")
    severity = "CRITICAL" if risk_level == "HIGH" else "WARNING" if risk_level == "MEDIUM" else "INFO"
    alert_data = {"turbine_id":"WT-001","severity":severity,"risk_level":risk_level,"anomaly_score":hardware_ai.get("anomaly_score",0),"prediction":prediction,"message":"Safe simulated anomaly alert. Physical hardware was not modified.","recommended_action":maintenance.get("recommended_action"),"inspection_type":maintenance.get("inspection_type"),"reason":maintenance.get("reason"),"components_to_inspect":maintenance.get("components_to_inspect",[]),"estimated_inspection_time":maintenance.get("estimated_inspection_time"),"priority":maintenance.get("priority"),"timestamp":datetime.now().isoformat(),"acknowledged":False,"sensor_data":test_data}
    if prediction == "ANOMALY":
        alert_history.insert(0, alert_data)
        if len(alert_history) > 100:
            alert_history.pop()
    return {"alert":prediction == "ANOMALY","data":alert_data}

@router.get("/history")
def get_alert_history():
    return {"count":len(alert_history),"alerts":alert_history}
