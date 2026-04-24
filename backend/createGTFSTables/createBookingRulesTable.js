import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

export const createBookingRulesTable = async () => {
  try {

    await getDb().run(`
        CREATE TABLE IF NOT EXISTS booking_rules (
          booking_rule_id TEXT PRIMARY KEY,
          booking_type INTEGER NOT NULL CHECK(booking_type >= 0 AND booking_type <= 2),
          prior_notice_duration_min INTEGER,
          prior_notice_duration_max INTEGER,
          prior_notice_last_day INTEGER,
          prior_notice_last_time TEXT,
          prior_notice_start_day INTEGER,
          prior_notice_start_time TEXT,
          prior_notice_service_id TEXT,
          message TEXT,
          pickup_message TEXT,
          drop_off_message TEXT,
          phone_number TEXT,
          info_url TEXT,
          booking_url TEXT
        )
      `)

    console.log("✓ booking_rules table created successfully")
  } catch (error) {
    console.error("Error preparing booking_rules table:", error)
    throw error
  }
}
