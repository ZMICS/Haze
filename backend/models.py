from pydantic import BaseModel

class VehiclePosition(BaseModel):
    vehicle_id: str
    latitude: float
    speed: float
    delay: int
    