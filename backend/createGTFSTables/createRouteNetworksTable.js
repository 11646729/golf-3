import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createRouteNetworksTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'route_networks'
      )`
    )

    if (tableExists.exists) {
      console.log("route_networks table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS route_networks")
    } else {
      console.log(
        "route_networks table does not exist - creating the empty table"
      )
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS route_networks (
          network_id TEXT NOT NULL,
          route_id TEXT NOT NULL,
          PRIMARY KEY (route_id)
        )
      `)

    console.log("✓ route_networks table created successfully")
  } catch (error) {
    console.error("Error preparing route_networks table:", error)
    res.status(500).send("Error preparing route_networks table")
  }
}
