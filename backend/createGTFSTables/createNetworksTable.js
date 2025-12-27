import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createNetworksTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'networks'
      )`
    )

    if (tableExists.exists) {
      console.log("networks table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS networks")
    } else {
      console.log("networks table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS networks (
          network_id TEXT PRIMARY KEY,
          network_name TEXT
        )
      `)

    console.log("✓ networks table created successfully")
  } catch (error) {
    console.error("Error preparing networks table:", error)
    res.status(500).send("Error preparing networks table")
  }
}
