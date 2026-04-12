import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true })

import { createDatabaseAdapter } from "../databaseUtilities.js"

const run = async () => {
  const db = await createDatabaseAdapter()

  await db.run(`
    CREATE TABLE IF NOT EXISTS vehicle_positions (
      vehicle_id    TEXT PRIMARY KEY,
      trip_id       TEXT,
      route_id      TEXT,
      latitude      REAL,
      longitude     REAL,
      bearing       REAL,
      speed         REAL,
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log("vehicle_positions table ready")

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_vehicle_positions_route_id
      ON vehicle_positions (route_id)
  `)
  console.log("idx_vehicle_positions_route_id index ready")

  process.exit(0)
}

run().catch((err) => {
  console.error("Migration failed:", err.message)
  process.exit(1)
})
