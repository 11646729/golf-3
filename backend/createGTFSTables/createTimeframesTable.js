import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createTimeframesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'timeframes'
      )`
    )

    if (tableExists.exists) {
      console.log("timeframes table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS timeframes")
    } else {
      console.log("timeframes table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS timeframes (
          timeframe_group_id TEXT NOT NULL,
          start_time TEXT DEFAULT '' NOT NULL,
          end_time TEXT DEFAULT '' NOT NULL,
          service_id TEXT NOT NULL,
          PRIMARY KEY (timeframe_group_id, service_id, start_time, end_time)
        )
      `)

    console.log("✓ timeframes table created successfully")
  } catch (error) {
    console.error("Error preparing timeframes table:", error)
    res.status(500).send("Error preparing timeframes table")
  }
}
