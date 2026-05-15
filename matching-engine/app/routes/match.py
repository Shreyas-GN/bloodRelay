from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio
from app.services.matching import get_nearby_donors
from app.services.notifier import send_sms, send_telegram_broadcast, send_push_notification

router = APIRouter()

class MatchRequest(BaseModel):
    blood_group: str
    latitude: float
    longitude: float
    hospital_name: str = "Unknown Hospital"
    units_required: int = 1

async def run_escalation_logic(data: MatchRequest):
    """
    Background task to handle multi-phase matching and notifications.
    """
    # PHASE 1: Immediate (5km)
    print(f"Starting Phase 1 for {data.blood_group} at {data.hospital_name}")
    donors_p1 = get_nearby_donors(data.latitude, data.longitude, 5, data.blood_group)
    for donor in donors_p1:
        await send_push_notification(
            donor['id'], 
            "Urgent: Blood Needed Nearby 🩸", 
            f"{data.units_required} units of {data.blood_group} needed at {data.hospital_name}"
        )

    # PHASE 2: Expanded (15km)
    # In a real production app, we would wait 5-10 minutes. 
    # For this implementation phase, we use a short delay to verify logic.
    await asyncio.sleep(10) 
    print(f"Starting Phase 2 for {data.blood_group}")
    donors_p2 = get_nearby_donors(data.latitude, data.longitude, 15, data.blood_group)
    for donor in donors_p2:
        await send_push_notification(
            donor['id'], 
            "Urgent: Expanded Search 🩸", 
            "Potential match found in expanded 15km radius."
        )

    # PHASE 3: Global/SMS (25km)
    await asyncio.sleep(10)
    print(f"Starting Phase 3 for {data.blood_group}")
    donors_p3 = get_nearby_donors(data.latitude, data.longitude, 25, data.blood_group)
    for donor in donors_p3:
        if donor.get('phone'):
            await send_sms(
                donor['phone'], 
                f"URGENT: {data.blood_group} blood required at {data.hospital_name}. Please check BloodReach app."
            )
    
    await send_telegram_broadcast(f"🚨 URGENT EMERGENCY: {data.blood_group} required at {data.hospital_name}. Units: {data.units_required}")

@router.post("/match-donors")
async def match_donors(data: MatchRequest, background_tasks: BackgroundTasks):
    print(f"Received match request for {data.blood_group}")
    
    # Start the background orchestration
    background_tasks.add_task(run_escalation_logic, data)
    
    return {
        "success": True,
        "message": "Matching and notification sequence initiated in background",
        "initial_phase": 1,
        "target_group": data.blood_group
    }