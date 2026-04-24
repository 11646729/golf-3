import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationsGeojsonTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS locations_geojson (
          location_id TEXT PRIMARY KEY,
          stop_name TEXT,
          stop_desc TEXT,
          geometry JSONB NOT NULL
        )
      `)

    console.log("✓ locations_geojson table created successfully")
  } catch (error) {
    console.error("Error preparing locations_geojson table:", error)
    throw error
  }
}
