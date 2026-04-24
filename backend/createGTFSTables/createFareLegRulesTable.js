import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareLegRulesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_leg_rules (
          network_id TEXT DEFAULT '' NOT NULL,
          from_area_id TEXT DEFAULT '' NOT NULL,
          to_area_id TEXT DEFAULT '' NOT NULL,
          from_timeframe_group_id TEXT DEFAULT '' NOT NULL,
          to_timeframe_group_id TEXT DEFAULT '' NOT NULL,
          fare_product_id TEXT NOT NULL,
          leg_group_id TEXT,
          rule_priority INTEGER DEFAULT 0,
          PRIMARY KEY (
            network_id,
            from_area_id,
            to_area_id,
            from_timeframe_group_id,
            to_timeframe_group_id,
            fare_product_id
          )
        )
      `)

    console.log("✓ fare_leg_rules table created successfully")
  } catch (error) {
    console.error("Error preparing fare_leg_rules table:", error)
    throw error
  }
}
