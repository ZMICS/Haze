"""Create a deterministic, simulated HAZE demo database.

This script intentionally seeds only the database layer.  It does not contact
any live transit service and does not implement GTFS ingestion or congestion
classification.
"""

from _future_ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
import sys

# Allow python database/seed.py from the HAZE project root as well as
# python seed.py from inside database/.
DATABASE_DIR = Path(_file_).resolve().parent
if str(DATABASE_DIR) not in sys.path:
    sys.path.insert(0, str(DATABASE_DIR))

from database import DATABASE_PATH, create_database, get_connection  # noqa: E402


ROUTES = [
    ("25A", "Hyderabad Central", 40.0, "#00D4FF"),
    ("10H", "Secunderabad - Hitech City", 50.0, "#7C5CFC"),
    ("218", "Mehdipatnam - Uppal", 40.0, "#FFB000"),
    ("5K", "Koti - Kukatpally", 35.0, "#FF5C8A"),
    ("49M", "Madhapur - Mehdipatnam", 45.0, "#39D98A"),
]

VEHICLES = [
    ("BUS-101", "25A", "active"),
    ("BUS-102", "25A", "active"),
    ("BUS-103", "25A", "active"),
    ("BUS-201", "10H", "active"),
    ("BUS-202", "10H", "active"),
    ("BUS-203", "10H", "active"),
    ("BUS-301", "218", "active"),
    ("BUS-302", "218", "active"),
    ("BUS-303", "218", "active"),
    ("BUS-401", "5K", "active"),
    ("BUS-402", "5K", "active"),
    ("BUS-403", "5K", "active"),
    ("BUS-501", "49M", "active"),
    ("BUS-502", "49M", "active"),
    ("BUS-503", "49M", "active"),
]

# Base coordinates/speeds/delays are simulated and intentionally varied so
# later backend demonstrations can exercise different traffic conditions.
POSITION_SEEDS = {
    "BUS-101": (17.3850, 78.4860, 24.5, 2.0),
    "BUS-102": (17.3920, 78.4800, 31.2, 0.0),
    "BUS-103": (17.3765, 78.4875, 16.8, 5.0),
    "BUS-201": (17.4399, 78.4983, 42.0, 1.0),
    "BUS-202": (17.4440, 78.3850, 28.5, 3.0),
    "BUS-203": (17.4250, 78.4080, 14.2, 8.0),
    "BUS-301": (17.3960, 78.4510, 22.5, 4.0),
    "BUS-302": (17.4100, 78.5120, 34.1, 1.0),
    "BUS-303": (17.3700, 78.5570, 11.5, 10.0),
    "BUS-401": (17.3850, 78.4700, 27.5, 2.0),
    "BUS-402": (17.4930, 78.3990, 19.0, 6.0),
    "BUS-403": (17.4550, 78.3700, 33.8, 0.0),
    "BUS-501": (17.4350, 78.3910, 36.5, 1.0),
    "BUS-502": (17.4140, 78.4480, 12.0, 9.0),
    "BUS-503": (17.4050, 78.4550, 25.0, 3.0),
}


# Fixed timestamp makes the database deterministic and easy to test.
BASE_TIME = datetime(2026, 10, 5, 12, 0, 0)


def build_position_rows() -> list[tuple[str, float, float, float, float, str]]:
    """Generate four historical records per vehicle at 30-second intervals."""
    rows: list[tuple[str, float, float, float, float, str]] = []

    for vehicle_index, (vehicle_id, _, _) in enumerate(VEHICLES):
        latitude, longitude, speed, delay = POSITION_SEEDS[vehicle_id]

        for step in range(4):
            timestamp = BASE_TIME + timedelta(seconds=30 * step)
            lat = latitude + (0.0009 * step) + (vehicle_index * 0.00001)
            lon = longitude + (0.0010 * step) + (vehicle_index * 0.00001)
            step_speed = max(0.0, speed + (0.6 * step) - (0.2 * (vehicle_index % 3)))
            step_delay = max(0.0, delay + ((step % 2) * 0.5) - (0.25 if step == 3 else 0))

            rows.append(
                (
                    vehicle_id,
                    round(lat, 6),
                    round(lon, 6),
                    round(step_speed, 2),
                    round(step_delay, 2),
                    timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                )
            )

    return rows


def seed_database() -> None:
    """Rebuild the demo contents atomically and print a concise summary."""
    create_database()
    position_rows = build_position_rows()

    connection = get_connection()
    try:
        connection.execute("BEGIN IMMEDIATE;")
        connection.execute("DELETE FROM vehicle_positions;")
        connection.execute("DELETE FROM vehicles;")
        connection.execute("DELETE FROM routes;")

        connection.executemany(
            """
            INSERT INTO routes (route_id, route_name, speed_limit, color)
            VALUES (?, ?, ?, ?)
            """,
            ROUTES,
        )
        connection.executemany(
            """
            INSERT INTO vehicles (vehicle_id, route_id, status)
            VALUES (?, ?, ?)
            """,
            VEHICLES,
        )
        connection.executemany(
            """
            INSERT INTO vehicle_positions
                (vehicle_id, latitude, longitude, speed, delay, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            position_rows,
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()

    print(f"Seeded simulated HAZE demo data into: {DATABASE_PATH}")
    print(f"Routes: {len(ROUTES)}")
    print(f"Vehicles: {len(VEHICLES)}")
    print(f"Vehicle positions: {len(position_rows)}")


if _name_ == "_main_":
    seed_database()
