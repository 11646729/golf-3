import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationGroupStopsTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'location_group_stops'
      )`
    )

    if (tableExists.exists) {
      console.log("location_group_stops table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS location_group_stops")
    } else {
      console.log(
        "location_group_stops table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing location_group_stops table")
  }
}
