import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createTripsTable = async () => {
  try {

    // GTFS Trips table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS trips (
          trip_id TEXT PRIMARY KEY,
          route_id TEXT NOT NULL,
          service_id TEXT NOT NULL,
          trip_headsign TEXT,
          trip_short_name TEXT,
          direction_id INTEGER CHECK(direction_id >= 0 AND direction_id <= 1),
          block_id TEXT,
          shape_id TEXT,
          wheelchair_accessible INTEGER CHECK(wheelchair_accessible >= 0 AND wheelchair_accessible <= 2),
          bikes_allowed INTEGER CHECK(bikes_allowed >= 0 AND bikes_allowed <= 2)
        )
      `)

    await getDb().run(`CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id)`)
    await getDb().run(`CREATE INDEX IF NOT EXISTS idx_trips_service_id ON trips(service_id)`)
    await getDb().run(`CREATE INDEX IF NOT EXISTS idx_trips_shape_id ON trips(shape_id)`)

    console.log("✓ trips table created successfully")
  } catch (error) {
    console.error("Error preparing trips table:", error)
    throw error
  }
}
