import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createRoutesTable = async () => {
  try {

    // GTFS Routes table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS routes (
          route_id TEXT PRIMARY KEY,
          agency_id TEXT,
          route_short_name TEXT,
          route_long_name TEXT,
          route_desc TEXT,
          route_type INTEGER NOT NULL,
          route_url TEXT,
          route_color TEXT,
          route_text_color TEXT,
          route_sort_order INTEGER,
          continuous_pickup INTEGER CHECK(continuous_pickup >= 0 AND continuous_pickup <= 3),
          continuous_drop_off INTEGER CHECK(continuous_drop_off >= 0 AND continuous_drop_off <= 3),
          network_id TEXT
        )
      `)

    await getDb().run(`CREATE INDEX IF NOT EXISTS idx_routes_agency_id ON routes(agency_id)`)

    console.log("✓ routes table created successfully")
  } catch (error) {
    console.error("Error preparing routes table:", error)
    throw error
  }
}
