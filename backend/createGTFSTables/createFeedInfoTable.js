import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFeedInfoTable = async (res) => {
  try {
    // Check if feed_info table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'feed_info'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("feed_info table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS feed_info")
    } else {
      console.log("feed_info table does not exist - creating the empty table")
    }

    // GTFS Feed Info table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS feed_info (
          feed_publisher_name TEXT NOT NULL,
          feed_publisher_url TEXT NOT NULL,
          feed_lang TEXT NOT NULL,
          default_lang TEXT,
          feed_start_date DATE,
          feed_end_date DATE,
          feed_version TEXT,
          feed_contact_email TEXT,
          feed_contact_url TEXT,
          feed_id TEXT PRIMARY KEY
        )
      `)

    console.log("✓ feed_info table created successfully")
  } catch (error) {
    console.error("Error preparing feed_info table:", error)
    res.status(500).send("Error preparing feed_info table")
  }
}
