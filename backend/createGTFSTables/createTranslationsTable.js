import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createTranslationsTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS translations (
          table_name TEXT NOT NULL,
          field_name TEXT NOT NULL,
          language TEXT NOT NULL,
          translation TEXT NOT NULL,
          record_id TEXT DEFAULT '' NOT NULL,
          record_sub_id TEXT DEFAULT '' NOT NULL,
          field_value TEXT DEFAULT '' NOT NULL,
          PRIMARY KEY (table_name, field_name, language, record_id, record_sub_id, field_value)
        )
      `)

    console.log("✓ translations table created successfully")
  } catch (error) {
    console.error("Error preparing translations table:", error)
    throw error
  }
}
