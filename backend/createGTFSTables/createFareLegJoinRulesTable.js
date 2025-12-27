import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareLegJoinRulesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'fare_leg_join_rules'
      )`
    )

    if (tableExists.exists) {
      console.log("fare_leg_join_rules table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS fare_leg_join_rules")
    } else {
      console.log(
        "fare_leg_join_rules table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing fare_leg_join_rules table")
  }
}
