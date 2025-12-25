import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyAgencyTable = async (res) => {
  try {
    // Check if agency table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'agency'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("agency table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS agency")
    } else {
      console.log("agency table does not exist - creating the empty table")
    }

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
    res.status(500).send("Error preparing agency table")
  }
}
