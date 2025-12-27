import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createLocationGroupsTable = async (res) => {
  try {
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'location_groups'
      )`
    )

    if (tableExists.exists) {
      console.log("location_groups table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS location_groups")
    } else {
      console.log(
        "location_groups table does not exist - creating the empty table"
      )
    }

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS location_groups (
          location_group_id TEXT PRIMARY KEY,
          location_group_name TEXT
        )
      `)

    console.log("✓ location_groups table created successfully")
  } catch (error) {
    console.error("Error preparing location_groups table:", error)
    res.status(500).send("Error preparing location_groups table")
  }
}
