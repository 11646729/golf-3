import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFrequenciesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS frequencies (
          trip_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          headway_secs INTEGER NOT NULL,
          exact_times INTEGER DEFAULT 0 CHECK(exact_times IN (0, 1)),
          PRIMARY KEY (trip_id, start_time)
        )
      `)

    console.log("✓ frequencies table created successfully")
  } catch (error) {
    console.error("Error preparing frequencies table:", error)
    throw error
  }
}
