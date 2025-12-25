import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyShapesTable = async (res) => {
  try {
    // Check if shapes table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'shapes'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("shapes table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS shapes")
    } else {
      console.log("shapes table does not exist - creating the empty table")
    }

    // GTFS Shapes table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS shapes (
          shape_id TEXT NOT NULL,
          shape_pt_lat NUMERIC NOT NULL,
          shape_pt_lon NUMERIC NOT NULL,
          shape_pt_sequence INTEGER NOT NULL,
          shape_dist_traveled NUMERIC,
          PRIMARY KEY (shape_id, shape_pt_sequence)
        )
      `)

    console.log("✓ shapes table created successfully")
  } catch (error) {
    console.error("Error preparing shapes table:", error)
    res.status(500).send("Error preparing shapes table")
  }
}
