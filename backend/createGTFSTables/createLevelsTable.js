import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLevelsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS levels (
          level_id TEXT PRIMARY KEY,
          level_index NUMERIC NOT NULL,
          level_name TEXT
        )
      `)

    console.log("✓ levels table created successfully")
  } catch (error) {
    console.error("Error preparing levels table:", error)
    throw error
  }
}
