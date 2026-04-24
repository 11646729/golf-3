import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createRiderCategoriesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS rider_categories (
          rider_category_id TEXT PRIMARY KEY,
          rider_category_name TEXT NOT NULL,
          is_default_fare_category INTEGER DEFAULT 0 NOT NULL CHECK(is_default_fare_category IN (0, 1)),
          eligibility_url TEXT
        )
      `)

    console.log("✓ rider_categories table created successfully")
  } catch (error) {
    console.error("Error preparing rider_categories table:", error)
    throw error
  }
}
