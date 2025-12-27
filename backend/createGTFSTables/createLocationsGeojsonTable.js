import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationsGeojsonTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'locations_geojson'
      )`
    )

    if (tableExists.exists) {
      console.log("locations_geojson table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS locations_geojson")
    } else {
      console.log(
        "locations_geojson table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing locations_geojson table")
  }
}
