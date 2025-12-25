import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyCalendarDatesTable = async (res) => {
  try {
    // Check if calendar_dates table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'calendar_dates'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("calendar_dates table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS calendar_dates")
    } else {
      console.log(
        "calendar_dates table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing calendar_dates table")
  }
}
