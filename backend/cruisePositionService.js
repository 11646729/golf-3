import { DatabaseAdapter } from "./databaseUtilities.js"
import { fetchAndSaveVesselPositions } from "./cruisemapperScraper.js"

// Replaces the aisstream.io feed as the source of vessel positions. CruiseMapper
// is a scrape rather than a stream, so positions are refreshed on a timer instead
// of arriving continuously.
const REFRESH_INTERVAL_MS =
  parseInt(process.env.CRUISE_POSITION_REFRESH_MS, 10) || 30 * 60 * 1000

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

// A full cycle takes a couple of minutes, so guard against a slow run
// overlapping the next tick and putting two scrapes on the site at once.
let refreshing = false

// Only vessels with an arrival in the window the schedule and map cover
// (yesterday → three months out), so we never scrape ships nothing can display.
const getVesselsToTrack = async () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

  try {
    return await getDb().all(
      `SELECT DISTINCT v.vesselname
       FROM belfastharbour_cruise_schedule s
       JOIN vessels v ON v.vesselid = s.vesselid
       WHERE s.vesseleta >= ? AND s.vesseleta < ?
       ORDER BY v.vesselname`,
      [yesterday.toISOString(), threeMonthsFromNow.toISOString()],
    )
  } catch (err) {
    // The schedule table only exists after the first PDF import.
    if (
      err.message?.includes(
        'relation "belfastharbour_cruise_schedule" does not exist',
      )
    ) {
      return []
    }
    throw err
  }
}

export const refreshVesselPositions = async (io) => {
  if (refreshing) {
    console.log("[CM] Position refresh still running — skipping this cycle")
    return { updated: 0, failed: 0, skipped: true }
  }

  refreshing = true
  try {
    const vessels = await getVesselsToTrack()
    if (vessels.length === 0) {
      console.log("[CM] No upcoming arrivals — nothing to refresh")
      return { updated: 0, failed: 0 }
    }
    return await fetchAndSaveVesselPositions(vessels, io)
  } catch (err) {
    console.error("[CM] Position refresh failed:", err.message)
    return { updated: 0, failed: 0, error: err.message }
  } finally {
    refreshing = false
  }
}

// Kick off an immediate refresh, then repeat on the interval. Errors inside a
// cycle are swallowed by refreshVesselPositions so a bad run never kills the timer.
export const startCruisePositionRefresh = (io) => {
  console.log(
    `[CM] Position refresh scheduled every ${REFRESH_INTERVAL_MS / 60000} minute(s)`,
  )
  refreshVesselPositions(io)
  const timer = setInterval(() => refreshVesselPositions(io), REFRESH_INTERVAL_MS)
  timer.unref?.()
  return timer
}
