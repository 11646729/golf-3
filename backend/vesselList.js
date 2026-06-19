import { DatabaseAdapter } from "./databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

export let vesselList = []

export const loadVesselList = async () => {
  const now = new Date().toISOString()
  const rows = await getDb().all(
    `SELECT DISTINCT ON (vesselname) vesselname, vessellengthmetre
     FROM belfastharbour_cruise_schedule
     WHERE vesseleta >= ?
     ORDER BY vesselname, vesseleta`,
    [now],
  )
  vesselList = rows.map((r) => ({
    vesselname: r.vesselname,
    vessellengthmetre: r.vessellengthmetre,
  }))
  console.log(`[VesselList] Loaded ${vesselList.length} vessel(s) from schedule`)
  return vesselList
}
