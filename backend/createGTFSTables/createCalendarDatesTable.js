import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createCalendarDatesTable = async () => {
  try {

    // GTFS Calendar Dates table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS calendar_dates (
          service_id TEXT NOT NULL,
          date DATE NOT NULL,
          exception_type INTEGER NOT NULL CHECK(exception_type >= 1 AND exception_type <= 2),
          holiday_name TEXT,
          PRIMARY KEY (service_id, date)
        )
      `)

    console.log("✓ calendar_dates table created successfully")
  } catch (error) {
    console.error("Error preparing calendar_dates table:", error)
    throw error
  }
}
