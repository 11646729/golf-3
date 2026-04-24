import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createRouteNetworksTable = async () => {
  try {

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
    throw error
  }
}
