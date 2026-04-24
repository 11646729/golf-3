import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createFareProductsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS fare_products (
          fare_product_id TEXT NOT NULL,
          fare_product_name TEXT,
          rider_category_id TEXT DEFAULT '' NOT NULL,
          fare_media_id TEXT DEFAULT '' NOT NULL,
          amount NUMERIC NOT NULL,
          currency TEXT NOT NULL,
          PRIMARY KEY (fare_product_id, rider_category_id, fare_media_id)
        )
      `)

    console.log("✓ fare_products table created successfully")
  } catch (error) {
    console.error("Error preparing fare_products table:", error)
    throw error
  }
}
