from fastapi import APIRouter

import services.live_hardware_service as hardware

router = APIRouter(
    prefix="/api/replay",
    tags=["Replay"]
)


@router.post("/hardware")
def replay_hardware(data: dict):

    data["source"] = "dataset_replay"

    updated_data = hardware.update_hardware_data(
        data
    )

    return {
        "status": "ok",
        "source": "dataset_replay",
        "replay_row": data.get("replay_row"),
        "data_updated": updated_data is not None
    }