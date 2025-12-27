import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareRulesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'fare_rules'
      )`
    )

    if (tableExists.exists) {
      console.log("fare_rules table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS fare_rules")
    } else {
      console.log("fare_rules table does not exist - creating the empty table")
    }

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
    res.status(500).send("Error preparing fare_rules table")
  }
}
