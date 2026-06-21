import dotenv from "dotenv"
dotenv.config()

import { DatabaseAdapter } from "./databaseUtilities.js"
import { fetchAndSaveVesselMMSIs } from "./cruisemapperScraper.js"

const db = new DatabaseAdapter()

const rows = await db.all(
  `SELECT vesselname, vessellengthmetre
   FROM vessels
   WHERE mmsi = 0 OR imo = 0
   ORDER BY vesselname`,
)

console.log(`Found ${rows.length} vessel(s) with missing MMSI or IMO\n`)
await fetchAndSaveVesselMMSIs(rows)

// Summary
const all = await db.all(
  `SELECT vesselname, vessellengthmetre, mmsi, imo
   FROM vessels
   ORDER BY vesselname`,
)
console.log("\n=== Vessel MMSI/IMO summary ===")
all.forEach((r) =>
  console.log(
    `  ${r.vesselname.padEnd(30)} length: ${String(r.vessellengthmetre ?? "?").padStart(4)}m` +
    `  MMSI: ${String(r.mmsi).padStart(12)}  IMO: ${r.imo}`,
  ),
)

process.exit(0)
