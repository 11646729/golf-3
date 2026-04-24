import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createAgencyTable = async () => {
  try {

    // GTFS Agency table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS agency (
          agency_id TEXT PRIMARY KEY,
          agency_name TEXT NOT NULL,
          agency_url TEXT NOT NULL,
          agency_timezone TEXT NOT NULL,
          agency_lang TEXT,
          agency_phone TEXT,
          agency_fare_url TEXT,
          agency_email TEXT,
          cemv_support INTEGER CHECK(cemv_support >= 0 AND cemv_support <= 2)
        )
      `)

    console.log("✓ agency table created successfully")
  } catch (error) {
    console.error("Error preparing agency table:", error)
    throw error
  }
}
