import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyLevelsTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'levels'
      )`
    )

    if (tableExists.exists) {
      console.log("levels table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS levels")
    } else {
      console.log("levels table does not exist - creating the empty table")
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS levels (
          level_id TEXT PRIMARY KEY,
          level_index NUMERIC NOT NULL,
          level_name TEXT
        )
      `)

    console.log("✓ levels table created successfully")
  } catch (error) {
    console.error("Error preparing levels table:", error)
    res.status(500).send("Error preparing levels table")
  }
}
