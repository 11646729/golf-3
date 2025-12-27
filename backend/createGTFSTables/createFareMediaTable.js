import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareMediaTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'fare_media'
      )`
    )

    if (tableExists.exists) {
      console.log("fare_media table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS fare_media")
    } else {
      console.log("fare_media table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_media (
          fare_media_id TEXT PRIMARY KEY,
          fare_media_name TEXT,
          fare_media_type INTEGER NOT NULL CHECK(fare_media_type >= 0 AND fare_media_type <= 4)
        )
      `)

    console.log("✓ fare_media table created successfully")
  } catch (error) {
    console.error("Error preparing fare_media table:", error)
    res.status(500).send("Error preparing fare_media table")
  }
}
