from fastapi import APIRouter
import services.live_hardware_service as hardware

router = APIRouter(prefix="/api/replay", tags=["Replay"])


@router.post("/hardware")
def replay_hardware(data: dict):
    hardware.latest_hardware_data = data

    return {
        "status": "ok",
        "replay_row": data.get("replay_row"),
        "source": "temporary_csv_replay"
    }