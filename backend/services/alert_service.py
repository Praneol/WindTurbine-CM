from datetime import datetime


def create_alert(turbine_status):
    status = turbine_status["condition"]
    health_score = turbine_status["health_score"]
    risk_level = turbine_status["risk_level"]

    # NORMAL CONDITION
    if status == "NORMAL" and risk_level == "LOW":
        return {
            "alert_id": None,
            "turbine_id": "WT-001",
            "severity": "NORMAL",
            "risk_level": risk_level,
            "health_score": health_score,
            "message": (
                "WT-001 is operating normally. "
                "No immediate inspection required."
            ),
            "timestamp": datetime.now().isoformat(),
            "acknowledged": True
        }

    # WARNING CONDITION
    if status == "WARNING" or risk_level == "MEDIUM":
        return {
            "alert_id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "turbine_id": "WT-001",
            "severity": "WARNING",
            "risk_level": risk_level,
            "health_score": health_score,
            "message": (
                f"WT-001 shows early signs of abnormal operation "
                f"with a health score of {health_score}%. "
                "Inspection recommended."
            ),
            "timestamp": datetime.now().isoformat(),
            "acknowledged": False
        }

    # CRITICAL CONDITION
    return {
        "alert_id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "turbine_id": "WT-001",
        "severity": "CRITICAL",
        "risk_level": risk_level,
        "health_score": health_score,
        "message": (
            f"WT-001 anomaly detected with a health score of "
            f"{health_score}%. Immediate inspection recommended."
        ),
        "timestamp": datetime.now().isoformat(),
        "acknowledged": False
    }