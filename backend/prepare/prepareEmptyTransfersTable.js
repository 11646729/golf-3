import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyTransfersTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'transfers'
      )`
    )

    if (tableExists.exists) {
      console.log("transfers table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS transfers")
    } else {
      console.log("transfers table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS transfers (
          from_stop_id TEXT DEFAULT '' NOT NULL,
          to_stop_id TEXT DEFAULT '' NOT NULL,
          from_route_id TEXT DEFAULT '' NOT NULL,
          to_route_id TEXT DEFAULT '' NOT NULL,
          from_trip_id TEXT DEFAULT '' NOT NULL,
          to_trip_id TEXT DEFAULT '' NOT NULL,
          transfer_type INTEGER NOT NULL CHECK(transfer_type >= 0 AND transfer_type <= 5),
          min_transfer_time INTEGER,
          PRIMARY KEY (
            from_stop_id,
            to_stop_id,
            from_trip_id,
            to_trip_id,
            from_route_id,
            to_route_id
          )
        )
      `)

    console.log("✓ transfers table created successfully")
  } catch (error) {
    console.error("Error preparing transfers table:", error)
    res.status(500).send("Error preparing transfers table")
  }
}
