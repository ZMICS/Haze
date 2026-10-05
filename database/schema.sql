-- HAZE SQLite schema
-- This file intentionally contains only the database layer.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS routes (
    route_id TEXT PRIMARY KEY CHECK (length(trim(route_id)) > 0),
    route_name TEXT NOT NULL CHECK (length(trim(route_name)) > 0),
    speed_limit REAL NOT NULL CHECK (speed_limit >= 0),
    color TEXT NOT NULL CHECK (
        length(color) = 7
        AND substr(color, 1, 1) = '#'
        AND lower(substr(color, 2)) NOT GLOB '[^0-9a-f]'
    )
);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id TEXT PRIMARY KEY CHECK (length(trim(vehicle_id)) > 0),
    route_id TEXT NOT NULL CHECK (length(trim(route_id)) > 0),
    status TEXT NOT NULL CHECK (length(trim(status)) > 0),
    FOREIGN KEY (route_id)
        REFERENCES routes(route_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS vehicle_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL CHECK (length(trim(vehicle_id)) > 0),
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    speed REAL NOT NULL CHECK (speed >= 0),
    delay REAL NOT NULL CHECK (delay >= 0),
    timestamp TEXT NOT NULL CHECK (datetime(timestamp) IS NOT NULL),
    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Fast lookup for vehicle history and latest-position queries.
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_vehicle_timestamp
    ON vehicle_positions(vehicle_id, timestamp DESC, id DESC);

-- Useful for time-window/history queries across the complete fleet.
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_timestamp
    ON vehicle_positions(timestamp DESC, id DESC);

-- Fast route -> vehicle lookup for the backend.
CREATE INDEX IF NOT EXISTS idx_vehicles_route_id
    ON vehicles(route_id);
