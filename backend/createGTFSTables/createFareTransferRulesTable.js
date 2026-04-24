import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareTransferRulesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_transfer_rules (
          from_leg_group_id TEXT DEFAULT '' NOT NULL,
          to_leg_group_id TEXT DEFAULT '' NOT NULL,
          fare_product_id TEXT DEFAULT '' NOT NULL,
          transfer_count INTEGER DEFAULT -1 NOT NULL,
          duration_limit INTEGER,
          duration_limit_type INTEGER CHECK(duration_limit_type >= 0 AND duration_limit_type <= 3),
          fare_transfer_type INTEGER NOT NULL CHECK(fare_transfer_type >= 0 AND fare_transfer_type <= 2),
          PRIMARY KEY (from_leg_group_id, to_leg_group_id, fare_product_id, transfer_count, duration_limit)
        )
      `)

    console.log("✓ fare_transfer_rules table created successfully")
  } catch (error) {
    console.error("Error preparing fare_transfer_rules table:", error)
    throw error
  }
}
