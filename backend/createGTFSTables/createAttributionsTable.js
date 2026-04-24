import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createAttributionsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS attributions (
          attribution_id TEXT PRIMARY KEY,
          agency_id TEXT,
          route_id TEXT,
          trip_id TEXT,
          organization_name TEXT NOT NULL,
          is_producer INTEGER CHECK(is_producer IN (0, 1)),
          is_operator INTEGER CHECK(is_operator IN (0, 1)),
          is_authority INTEGER CHECK(is_authority IN (0, 1)),
          attribution_url TEXT,
          attribution_email TEXT,
          attribution_phone TEXT
        )
      `)

    console.log("✓ attributions table created successfully")
  } catch (error) {
    console.error("Error preparing attributions table:", error)
    throw error
  }
}
