import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createNetworksTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS networks (
          network_id TEXT PRIMARY KEY,
          network_name TEXT
        )
      `)

    console.log("✓ networks table created successfully")
  } catch (error) {
    console.error("Error preparing networks table:", error)
    throw error
  }
}
