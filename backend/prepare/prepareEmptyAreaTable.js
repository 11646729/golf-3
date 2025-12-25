import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyAreaTable = async (res) => {
  try {
    // Check if area table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'area'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("area table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS area")
    } else {
      console.log("area table does not exist - creating the empty table")
    }

    // GTFS Area table (for flex services)
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS area (
          area_id TEXT PRIMARY KEY,
          area_name TEXT,
          area_lat NUMERIC,
          area_lon NUMERIC
        )
      `)

    console.log("✓ area table created successfully")
  } catch (error) {
    console.error("Error preparing area table:", error)
    res.status(500).send("Error preparing area table")
  }
}
