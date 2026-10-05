from backend.models import VehiclePosition

def parse_vehicle(data: dict) -> VehiclePosition:
    return VehiclePosition(
      vehicle_id=data["vehicle_id"],
      route_id=data["route_id"],
      latitude=data["latitude"],
      longitude=data["longitude"],
      speed=data["speed"],
      delay=data["delay"]
    )