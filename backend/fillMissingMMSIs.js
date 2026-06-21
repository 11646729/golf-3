import dotenv from "dotenv"
dotenv.config()

import { DatabaseAdapter } from "./databaseUtilities.js"
import { fetchAndSaveVesselMMSIs } from "./cruisemapperScraper.js"

const db = new DatabaseAdapter()

const rows = await db.all(
  `SELECT DISTINCT vesselname, vessellengthmetre
   FROM belfastharbour_cruise_schedule
   WHERE mmsi = 0
   ORDER BY vesselname`
)

console.log(`Found ${rows.length} vessel(s) with MMSI = 0\n`)
await fetchAndSaveVesselMMSIs(rows)

// Summary
const updated = await db.all(
  `SELECT DISTINCT vesselname, vessellengthmetre, mmsi, imo
   FROM belfastharbour_cruise_schedule
   ORDER BY vesselname`
)
console.log("\n=== Final MMSI/IMO summary ===")
updated.forEach(r =>
  console.log(`  ${r.vesselname.padEnd(30)} length: ${String(r.vessellengthmetre ?? "?").padStart(4)}m  MMSI: ${String(r.mmsi).padStart(12)}  IMO: ${r.imo}`)
)

process.exit(0)
