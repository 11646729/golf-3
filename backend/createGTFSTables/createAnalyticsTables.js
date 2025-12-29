import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createAnalyticsTables = async (res) => {
  try {
    // Check if tables already exist
    const tableCheck = await getDb().get(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('api_access_log', 'gtfs_import_log', 'gtfs_realtime_log')
    `)

    // If all 3 tables exist, skip creation
    if (tableCheck && parseInt(tableCheck.count) === 3) {
      // If exists then delete the tables and recreate
      console.log("analytics logging tables exist - dropping and recreating")
      await getDb().run(
        "DROP TABLE IF EXISTS api_access_log, gtfs_import_log, gtfs_realtime_log"
      )
    } else {
      console.log(
        "analytics logging tables do not exist - creating the empty tables"
      )
    }

    // API access log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS api_access_log (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        record_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GTFS import log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS gtfs_import_log (
        id SERIAL PRIMARY KEY,
        import_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL,
        duration_ms INTEGER,
        file_size_mb DECIMAL(10,2),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GTFS realtime log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS gtfs_realtime_log (
        id SERIAL PRIMARY KEY,
        update_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("✓ analytics logging tables created successfully")
  } catch (error) {
    console.error("Failed to create analytic logging tables:", error.message)
    res.status(500).send("Error preparing analytics logging tables")
  }
}
