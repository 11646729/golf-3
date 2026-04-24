import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationGroupStopsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS location_group_stops (
          location_group_id TEXT NOT NULL,
          stop_id TEXT NOT NULL,
          PRIMARY KEY (location_group_id, stop_id)
        )
      `)

    console.log("✓ location_group_stops table created successfully")
  } catch (error) {
    console.error("Error preparing location_group_stops table:", error)
    throw error
  }
}
