import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareMediaTable = async () => {
  try {

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
    throw error
  }
}
