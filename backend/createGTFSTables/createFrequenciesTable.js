import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFrequenciesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'frequencies'
      )`
    )

    if (tableExists.exists) {
      console.log("frequencies table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS frequencies")
    } else {
      console.log("frequencies table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS frequencies (
          trip_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          headway_secs INTEGER NOT NULL,
          exact_times INTEGER DEFAULT 0 CHECK(exact_times IN (0, 1)),
          PRIMARY KEY (trip_id, start_time)
        )
      `)

    console.log("✓ frequencies table created successfully")
  } catch (error) {
    console.error("Error preparing frequencies table:", error)
    res.status(500).send("Error preparing frequencies table")
  }
}
