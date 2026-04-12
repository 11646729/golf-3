import axios from "axios"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"
import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

// Transport for Ireland GTFS-RT vehicle positions feed
// Requires TRANSPORT_FOR_IRELAND_RT_API_KEY in backend/.env
const VEHICLE_POSITIONS_URL =
  "https://api.nationaltransport.ie/gtfsr/v2/Vehicles"

// -------------------------------------------------------
// Create vehicle_positions table if it doesn't exist
// Called once at startup from server.js
// -------------------------------------------------------
export const createVehiclePositionsTable = async () => {
  await getDb().run(`
    CREATE TABLE IF NOT EXISTS vehicle_positions (
      vehicle_id    TEXT PRIMARY KEY,
      trip_id       TEXT,
      route_id      TEXT,
      latitude      REAL,
      longitude     REAL,
      bearing       REAL,
      speed         REAL,
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await getDb().run(`
    CREATE INDEX IF NOT EXISTS idx_vehicle_positions_route_id
      ON vehicle_positions (route_id)
  `)
}

// -------------------------------------------------------
// Fetch GTFS-RT protobuf feed and return parsed entities
// -------------------------------------------------------
export const fetchVehiclePositions = async () => {
  const response = await axios.get(VEHICLE_POSITIONS_URL, {
    headers: {
      "x-api-key": process.env.TRANSPORT_FOR_IRELAND_RT_API_KEY,
    },
    responseType: "arraybuffer",
    timeout: 10000,
  })

  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(response.data),
  )

  // Return only entities that have a vehicle position
  return feed.entity.filter((entity) => entity.vehicle?.position)
}

// -------------------------------------------------------
// Upsert vehicle positions to PostgreSQL
// -------------------------------------------------------
const saveVehiclePositions = async (entities) => {
  for (const entity of entities) {
    const { vehicle } = entity
    const vehicleId = vehicle.vehicle?.id ?? entity.id
    const tripId = vehicle.trip?.tripId ?? null
    const routeId = vehicle.trip?.routeId ?? null
    const { latitude, longitude, bearing, speed } = vehicle.position

    await getDb().run(
      `INSERT INTO vehicle_positions
         (vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
       ON CONFLICT (vehicle_id) DO UPDATE SET
         trip_id    = EXCLUDED.trip_id,
         route_id   = EXCLUDED.route_id,
         latitude   = EXCLUDED.latitude,
         longitude  = EXCLUDED.longitude,
         bearing    = EXCLUDED.bearing,
         speed      = EXCLUDED.speed,
         updated_at = NOW()`,
      [vehicleId, tripId, routeId, latitude, longitude, bearing ?? null, speed ?? null],
    )
  }
}

// -------------------------------------------------------
// Read current vehicle positions from PostgreSQL
// Optionally filter by routeId
// -------------------------------------------------------
export const getVehiclePositionsFromDb = async (routeId = null) => {
  if (routeId) {
    return getDb().all(
      `SELECT vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed
       FROM vehicle_positions
       WHERE route_id = ?
       AND updated_at > NOW() - INTERVAL '2 minutes'`,
      [routeId],
    )
  }
  return getDb().all(
    `SELECT vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed
     FROM vehicle_positions
     WHERE updated_at > NOW() - INTERVAL '2 minutes'`,
  )
}

// -------------------------------------------------------
// Fetch → save → return positions (called by cron job)
// -------------------------------------------------------
export const updateAndGetVehiclePositions = async () => {
  const entities = await fetchVehiclePositions()
  await saveVehiclePositions(entities)
  return getVehiclePositionsFromDb()
}

// -------------------------------------------------------
// Socket.io emit — same pattern as emitTemperatureData
// -------------------------------------------------------
export const emitVehiclePositions = (socket, positions, stillLoading) => {
  if (!socket || positions == null || stillLoading == null) return
  socket.emit("FromGtfsVehiclePositions", positions)
  socket.emit("FromIsLoadingGtfsVehiclePositions", stillLoading)
}
