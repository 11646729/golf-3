import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createAreasTable = async () => {
  try {

    // GTFS Area table (for flex services)
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS areas (
          area_id TEXT PRIMARY KEY,
          area_name TEXT,
          area_lat NUMERIC,
          area_lon NUMERIC
        )
      `)

    console.log("✓ area table created successfully")
  } catch (error) {
    console.error("Error preparing areas table:", error)
    throw error
  }
}
