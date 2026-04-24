import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createStopAreasTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS stop_areas (
          area_id TEXT NOT NULL,
          stop_id TEXT NOT NULL,
          PRIMARY KEY (area_id, stop_id)
        )
      `)

    console.log("✓ stop_areas table created successfully")
  } catch (error) {
    console.error("Error preparing stop_areas table:", error)
    throw error
  }
}
