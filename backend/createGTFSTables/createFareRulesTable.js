import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareRulesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_rules (
          fare_id TEXT NOT NULL,
          route_id TEXT DEFAULT '' NOT NULL,
          origin_id TEXT DEFAULT '' NOT NULL,
          destination_id TEXT DEFAULT '' NOT NULL,
          contains_id TEXT DEFAULT '' NOT NULL,
          PRIMARY KEY (fare_id, route_id, origin_id, destination_id, contains_id)
        )
      `)

    console.log("✓ fare_rules table created successfully")
  } catch (error) {
    console.error("Error preparing fare_rules table:", error)
    throw error
  }
}
