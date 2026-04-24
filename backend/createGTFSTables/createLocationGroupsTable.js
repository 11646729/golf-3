import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationGroupsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS location_groups (
          location_group_id TEXT PRIMARY KEY,
          location_group_name TEXT
        )
      `)

    console.log("✓ location_groups table created successfully")
  } catch (error) {
    console.error("Error preparing location_groups table:", error)
    throw error
  }
}
