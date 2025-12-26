import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyRiderCategoriesTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'rider_categories'
      )`
    )

    if (tableExists.exists) {
      console.log("rider_categories table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS rider_categories")
    } else {
      console.log(
        "rider_categories table does not exist - creating the empty table"
      )
    }

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
    res.status(500).send("Error preparing rider_categories table")
  }
}
