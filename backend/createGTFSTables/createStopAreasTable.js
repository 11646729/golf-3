import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createStopAreasTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'stop_areas'
      )`
    )

    if (tableExists.exists) {
      console.log("stop_areas table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS stop_areas")
    } else {
      console.log("stop_areas table does not exist - creating the empty table")
    }

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
    res.status(500).send("Error preparing stop_areas table")
  }
}
