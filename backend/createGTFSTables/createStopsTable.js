import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createStopsTable = async () => {
  try {

    // GTFS Stops table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS stops (
        stop_id text PRIMARY KEY,
        stop_code text,
        stop_name text,
        tts_stop_name text,
        stop_desc text,
        stop_lat numeric(9,6) CHECK (stop_lat BETWEEN -90 AND 90),
        stop_lon numeric(10,6) CHECK (stop_lon BETWEEN -180 AND 180),
        zone_id text,
        stop_url text,
        location_type smallint CHECK (location_type BETWEEN 0 AND 4),
        parent_station text,
        stop_timezone text,
        wheelchair_boarding smallint CHECK (wheelchair_boarding BETWEEN 0 AND 2),
        level_id text,
        platform_code text,
        stop_access smallint CHECK (stop_access BETWEEN 0 AND 1)
      )
    `)
    console.log("✓ stops table created successfully")
  } catch (error) {
    console.error("Error preparing stops table:", error)
    throw error
  }
}
