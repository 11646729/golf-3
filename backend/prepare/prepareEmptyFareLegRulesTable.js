import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyFareLegRulesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'fare_leg_rules'
      )`
    )

    if (tableExists.exists) {
      console.log("fare_leg_rules table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS fare_leg_rules")
    } else {
      console.log(
        "fare_leg_rules table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing fare_leg_rules table")
  }
}
