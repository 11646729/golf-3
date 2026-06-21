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
    `SELECT DISTINCT v.vesselname, v.vessellengthmetre
     FROM vessels v
     JOIN belfastharbour_cruise_schedule s ON s.vesselid = v.vesselid
     WHERE s.vesseleta >= ? AND (v.mmsi = 0 OR v.imo = 0)
     ORDER BY v.vesselname`,
    [now],
  )
  vesselList = rows.map((r) => ({
    vesselname: r.vesselname,
    vessellengthmetre: r.vessellengthmetre,
  }))
  console.log(`[VesselList] ${vesselList.length} vessel(s) need MMSI/IMO lookup`)
  return vesselList
}
