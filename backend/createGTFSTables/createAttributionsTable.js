import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createAttributionsTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'attributions'
      )`
    )

    if (tableExists.exists) {
      console.log("attributions table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS attributions")
    } else {
      console.log(
        "attributions table does not exist - creating the empty table"
      )
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS attributions (
          attribution_id TEXT PRIMARY KEY,
          agency_id TEXT,
          route_id TEXT,
          trip_id TEXT,
          organization_name TEXT NOT NULL,
          is_producer INTEGER CHECK(is_producer IN (0, 1)),
          is_operator INTEGER CHECK(is_operator IN (0, 1)),
          is_authority INTEGER CHECK(is_authority IN (0, 1)),
          attribution_url TEXT,
          attribution_email TEXT,
          attribution_phone TEXT
        )
      `)

    console.log("✓ attributions table created successfully")
  } catch (error) {
    console.error("Error preparing attributions table:", error)
    res.status(500).send("Error preparing attributions table")
  }
}
