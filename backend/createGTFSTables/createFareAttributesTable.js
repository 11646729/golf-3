import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareAttributesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_attributes (
          fare_id TEXT PRIMARY KEY,
          price NUMERIC NOT NULL,
          currency_type TEXT NOT NULL,
          payment_method INTEGER NOT NULL CHECK(payment_method >= 0 AND payment_method <= 1),
          transfers INTEGER CHECK(transfers >= 0 AND transfers <= 2),
          agency_id TEXT,
          transfer_duration INTEGER
        )
      `)

    console.log("✓ fare_attributes table created successfully")
  } catch (error) {
    console.error("Error preparing fare_attributes table:", error)
    throw error
  }
}
