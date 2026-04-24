import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createPathwaysTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS pathways (
          pathway_id TEXT PRIMARY KEY,
          from_stop_id TEXT NOT NULL,
          to_stop_id TEXT NOT NULL,
          pathway_mode INTEGER NOT NULL,
          is_bidirectional INTEGER NOT NULL CHECK(is_bidirectional IN (0, 1)),
          length NUMERIC,
          traversal_time INTEGER,
          stair_count INTEGER,
          max_slope NUMERIC,
          min_width NUMERIC,
          signposted_as TEXT,
          reversed_signposted_as TEXT
        )
      `)

    console.log("✓ pathways table created successfully")
  } catch (error) {
    console.error("Error preparing pathways table:", error)
    throw error
  }
}
