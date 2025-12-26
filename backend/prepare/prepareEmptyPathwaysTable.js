import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyPathwaysTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'pathways'
      )`
    )

    if (tableExists.exists) {
      console.log("pathways table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS pathways")
    } else {
      console.log("pathways table does not exist - creating the empty table")
    }

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
    res.status(500).send("Error preparing pathways table")
  }
}
