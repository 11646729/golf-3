import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareLegJoinRulesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_leg_join_rules (
          from_network_id TEXT NOT NULL,
          to_network_id TEXT NOT NULL,
          from_stop_id TEXT DEFAULT '' NOT NULL,
          to_stop_id TEXT DEFAULT '' NOT NULL,
          PRIMARY KEY (from_network_id, to_network_id, from_stop_id, to_stop_id)
        )
      `)

    console.log("✓ fare_leg_join_rules table created successfully")
  } catch (error) {
    console.error("Error preparing fare_leg_join_rules table:", error)
    throw error
  }
}
