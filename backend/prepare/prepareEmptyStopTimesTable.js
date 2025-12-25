import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const prepareEmptyStopTimesTable = async (res) => {
  try {
    // Check if stop_times table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'stop_times'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("stop_times table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS stop_times")
    } else {
      console.log("stop_times table does not exist - creating the empty table")
    }

    // GTFS Stop Times table
    await getDb().run(`
        CREATE TABLE IF NOT EXISTS stop_times (
          trip_id TEXT NOT NULL,
          arrival_time TEXT NOT NULL,
          departure_time TEXT NOT NULL,
          stop_id TEXT NOT NULL,
          stop_sequence INTEGER NOT NULL,
          stop_headsign TEXT,
          pickup_type INTEGER DEFAULT 0 CHECK(pickup_type >= 0 AND pickup_type <= 3),
          drop_off_type INTEGER DEFAULT 0 CHECK(drop_off_type >= 0 AND drop_off_type <= 3),
          continuous_pickup INTEGER CHECK(continuous_pickup >= 0 AND continuous_pickup <= 3),
          continuous_drop_off INTEGER CHECK(continuous_drop_off >= 0 AND continuous_drop_off <= 3),
          shape_dist_traveled NUMERIC,
          timepoint INTEGER CHECK(timepoint >= 0 AND timepoint <= 1),
          PRIMARY KEY (trip_id, stop_sequence)
        )
      `)

    console.log("✓ stop_times table created successfully")
  } catch (error) {
    console.error("Error preparing stop_times table:", error)
    res.status(500).send("Error preparing stop_times table")
  }
}
