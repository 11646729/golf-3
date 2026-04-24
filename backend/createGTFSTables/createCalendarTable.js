import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createCalendarTable = async () => {
  try {

    // GTFS Calendar table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS calendar (
          service_id TEXT PRIMARY KEY,
          monday INTEGER NOT NULL CHECK(monday >= 0 AND monday <= 1),
          tuesday INTEGER NOT NULL CHECK(tuesday >= 0 AND tuesday <= 1),
          wednesday INTEGER NOT NULL CHECK(wednesday >= 0 AND wednesday <= 1),
          thursday INTEGER NOT NULL CHECK(thursday >= 0 AND thursday <= 1),
          friday INTEGER NOT NULL CHECK(friday >= 0 AND friday <= 1),
          saturday INTEGER NOT NULL CHECK(saturday >= 0 AND saturday <= 1),
          sunday INTEGER NOT NULL CHECK(sunday >= 0 AND sunday <= 1),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL
        )
      `)

    console.log("✓ calendar table created successfully")
  } catch (error) {
    console.error("Error preparing calendar table:", error)
    throw error
  }
}
