"""HAZE SQLite database layer.

This module deliberately contains only database concerns.  It does not contain
FastAPI, frontend, GTFS, AI, machine-learning, or congestion-classification
logic.

The public helpers return ordinary Python dictionaries/lists so a future
FastAPI layer can consume them without knowing SQLite's Row type.
"""

from _future_ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Iterable

DATABASE_PATH = Path(_file_).resolve().parent / "transit.db"
SCHEMA_PATH = Path(_file_).resolve().parent / "schema.sql"


class DatabaseError(RuntimeError):
    """Raised when a HAZE database operation fails at the database layer."""


def get_connection() -> sqlite3.Connection:
    """Open a reliable SQLite connection configured for application use.

    Foreign keys are enabled per connection because SQLite does not persist
    that setting globally. WAL mode improves read/write concurrency for the
    later backend while keeping the database as a single local SQLite file.
    """
    try:
        connection = sqlite3.connect(
            DATABASE_PATH,
            timeout=10.0,
            isolation_level=None,
        )
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON;")
        connection.execute("PRAGMA busy_timeout = 10000;")
        connection.execute("PRAGMA journal_mode = WAL;")
        connection.execute("PRAGMA synchronous = NORMAL;")
        return connection
    except sqlite3.Error as exc:
        raise DatabaseError(f"Unable to open HAZE database: {exc}") from exc


def _rows_to_dicts(rows: Iterable[sqlite3.Row]) -> list[dict[str, Any]]:
    """Convert SQLite rows into normal Python dictionaries."""
    return [dict(row) for row in rows]


def _require_id(value: str, field_name: str) -> str:
    """Validate an ID before it reaches a query."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value.strip()


def create_database() -> None:
    """Create the HAZE schema and indexes if they do not exist."""
    if not SCHEMA_PATH.exists():
        raise DatabaseError(f"Schema file not found: {SCHEMA_PATH}")

    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    connection = get_connection()
    try:
        connection.executescript(schema)
    except sqlite3.Error as exc:
        raise DatabaseError(f"Unable to create HAZE schema: {exc}") from exc
    finally:
        connection.close()


def database_health_check() -> dict[str, Any]:
    """Return a small health/status snapshot useful to the future backend."""
    connection = get_connection()
    try:
        foreign_keys = connection.execute("PRAGMA foreign_keys;").fetchone()[0]
        integrity = connection.execute("PRAGMA integrity_check;").fetchone()[0]
        return {
            "database": str(DATABASE_PATH),
            "exists": DATABASE_PATH.exists(),
            "foreign_keys": bool(foreign_keys),
            "integrity_check": integrity,
            "healthy": bool(foreign_keys) and integrity == "ok",
        }
    except sqlite3.Error as exc:
        raise DatabaseError(f"Database health check failed: {exc}") from exc
    finally:
        connection.close()


def get_routes() -> list[dict[str, Any]]:
    """Return all routes ordered by route ID."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT route_id, route_name, speed_limit, color
            FROM routes
            ORDER BY route_id
            """
        ).fetchall()
    return _rows_to_dicts(rows)


def get_route(route_id: str) -> dict[str, Any] | None:
    """Return one route by ID, or None when it does not exist."""
    route_id = _require_id(route_id, "route_id")
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT route_id, route_name, speed_limit, color
            FROM routes
            WHERE route_id = ?
            """,
            (route_id,),
        ).fetchone()
    return dict(row) if row else None


def get_vehicles() -> list[dict[str, Any]]:
    """Return all vehicles with their route information."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT v.vehicle_id, v.route_id, v.status, r.route_name
            FROM vehicles AS v
            JOIN routes AS r ON r.route_id = v.route_id
            ORDER BY v.vehicle_id
            """
        ).fetchall()
    return _rows_to_dicts(rows)


def get_vehicle(vehicle_id: str) -> dict[str, Any] | None:
    """Return one vehicle with route information, or None when absent."""
    vehicle_id = _require_id(vehicle_id, "vehicle_id")
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT v.vehicle_id, v.route_id, v.status, r.route_name
            FROM vehicles AS v
            JOIN routes AS r ON r.route_id = v.route_id
            WHERE v.vehicle_id = ?
            """,
            (vehicle_id,),
        ).fetchone()
    return dict(row) if row else None


def get_latest_vehicle_position(vehicle_id: str) -> dict[str, Any] | None:
    """Return the newest stored position for one vehicle."""
    vehicle_id = _require_id(vehicle_id, "vehicle_id")
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, vehicle_id, latitude, longitude, speed, delay, timestamp
            FROM vehicle_positions
            WHERE vehicle_id = ?
            ORDER BY timestamp DESC, id DESC
            LIMIT 1
            """,
            (vehicle_id,),
        ).fetchone()
    return dict(row) if row else None


def get_latest_vehicle_positions() -> list[dict[str, Any]]:
    """Return exactly one newest position for every vehicle with position data.

    Timestamp is the primary ordering key; ID breaks ties deterministically if
    two position records have the same timestamp.
    """
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT vp.id, vp.vehicle_id, vp.latitude, vp.longitude,
                   vp.speed, vp.delay, vp.timestamp,
                   v.route_id, v.status,
                   r.route_name, r.speed_limit, r.color
            FROM vehicle_positions AS vp
            JOIN vehicles AS v ON v.vehicle_id = vp.vehicle_id
            JOIN routes AS r ON r.route_id = v.route_id
            WHERE NOT EXISTS (
                SELECT 1
                FROM vehicle_positions AS newer
                WHERE newer.vehicle_id = vp.vehicle_id
                  AND (
                      newer.timestamp > vp.timestamp
                      OR (
                          newer.timestamp = vp.timestamp
                          AND newer.id > vp.id
                      )
                  )
            )
            ORDER BY vp.vehicle_id
            """
        ).fetchall()
    return _rows_to_dicts(rows)


def get_vehicle_positions(vehicle_id: str) -> list[dict[str, Any]]:
    """Return all historical positions for a vehicle, newest first."""
    vehicle_id = _require_id(vehicle_id, "vehicle_id")
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, vehicle_id, latitude, longitude, speed, delay, timestamp
            FROM vehicle_positions
            WHERE vehicle_id = ?
            ORDER BY timestamp DESC, id DESC
            """,
            (vehicle_id,),
        ).fetchall()
    return _rows_to_dicts(rows)


def get_route_vehicles(route_id: str) -> list[dict[str, Any]]:
    """Return all vehicles currently assigned to a route."""
    route_id = _require_id(route_id, "route_id")
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT vehicle_id, route_id, status
            FROM vehicles
            WHERE route_id = ?
            ORDER BY vehicle_id
            """,
            (route_id,),
        ).fetchall()
    return _rows_to_dicts(rows)


def get_congestion_data() -> list[dict[str, Any]]:
    """Return latest raw speed/delay data plus route speed limits.

    No NORMAL/SLOW/CONGESTED classification is performed here.  That belongs
    to a later backend component, exactly as required by the project scope.
    """
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT vp.vehicle_id,
                   v.route_id,
                   r.route_name,
                   r.speed_limit,
                   vp.speed,
                   vp.delay,
                   vp.timestamp
            FROM vehicle_positions AS vp
            JOIN vehicles AS v ON v.vehicle_id = vp.vehicle_id
            JOIN routes AS r ON r.route_id = v.route_id
            WHERE NOT EXISTS (
                SELECT 1
                FROM vehicle_positions AS newer
                WHERE newer.vehicle_id = vp.vehicle_id
                  AND (
                      newer.timestamp > vp.timestamp
                      OR (
                          newer.timestamp = vp.timestamp
                          AND newer.id > vp.id
                      )
                  )
            )
            ORDER BY v.route_id, vp.vehicle_id
            """
        ).fetchall()
    return _rows_to_dicts(rows)


if _name_ == "_main_":
    create_database()
    print(database_health_check())
    print(f"Database ready: {DATABASE_PATH}")
