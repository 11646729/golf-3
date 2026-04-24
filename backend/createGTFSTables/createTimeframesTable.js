import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createTimeframesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS timeframes (
          timeframe_group_id TEXT NOT NULL,
          start_time TEXT DEFAULT '' NOT NULL,
          end_time TEXT DEFAULT '' NOT NULL,
          service_id TEXT NOT NULL,
          PRIMARY KEY (timeframe_group_id, service_id, start_time, end_time)
        )
      `)

    console.log("✓ timeframes table created successfully")
  } catch (error) {
    console.error("Error preparing timeframes table:", error)
    throw error
  }
}
