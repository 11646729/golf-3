import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createShapesTable = async () => {
  try {

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
    throw error
  }
}
