import { importBelfastScheduleFromPdf } from "../belfastScheduleImport.js"
import { DatabaseAdapter } from "../databaseUtilities.js"
import { ensureLogoCached } from "../cruiseLineLogoCache.js"
import { getGeoFilter, setGeoFilter } from "../aisStreamService.js"
import { fetchAndSaveVesselPositionFromWeb } from "../cruisemapperScraper.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

let belfastImportStatus = {
  status: "idle", // "idle" | "running" | "complete" | "error"
  modDate: null,
  rowCount: 0,
  error: null,
}

// -------------------------------------------------------
// Function to fetch Belfast Harbour Cruise Schedule importation status
// -------------------------------------------------------
export const getBelfastImportStatus = () => ({ ...belfastImportStatus })

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/cruise/
// -------------------------------------------------------
export var index = async (req, res) => {
  res.status(200).send({ response: "Port Arrivals Catalog home page" })
}

// -------------------------------------------------------
// GET current vessel positions from vesselpositions table
// -------------------------------------------------------
export const getVesselPositions = async (_req, res) => {
  try {
    const rows = await getDb().all(
      `SELECT v.mmsi, v.vesselname,
              vp.latitude AS lat, vp.longitude AS lng,
              vp.recordedat, vp.sog, vp.cog, vp.heading, vp.navstatus
       FROM vesselpositions vp
       JOIN vessels v ON v.vesselid = vp.vesselid
       WHERE v.mmsi != 0 AND vp.latitude IS NOT NULL AND vp.longitude IS NOT NULL`,
    )
    res.json({ data: rows })
  } catch (err) {
    console.error("getVesselPositions error:", err.message)
    res.status(400).json({ error: err.message })
  }
}

// -------------------------------------------------------
// AIS geographic filter toggle
// -------------------------------------------------------
export const getAisGeoFilter = (_req, res) => {
  res.json({ geoFilterEnabled: getGeoFilter() })
}

export const setAisGeoFilter = (req, res) => {
  const { enabled } = req.body
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "enabled must be a boolean" })
  }
  setGeoFilter(enabled)
  res.json({ geoFilterEnabled: enabled })
}

// -------------------------------------------------------
// POST /api/cruise/scrapePosition  { vesselname }
// Scrapes current vessel position from CruiseMapper and saves it
// -------------------------------------------------------
export const scrapeVesselPosition = async (req, res) => {
  const { vesselname } = req.body
  if (!vesselname || typeof vesselname !== "string") {
    return res.status(400).json({ error: "vesselname is required" })
  }

  // io is attached to res.app by server.js
  const io = req.app.get("io")
  try {
    const result = await fetchAndSaveVesselPositionFromWeb(vesselname.trim(), io)
    if (!result.success) return res.status(404).json({ error: result.reason })
    res.json({ lat: result.lat, lng: result.lng })
  } catch (err) {
    console.error("scrapeVesselPosition error:", err.message)
    res.status(500).json({ error: err.message })
  }
}

// -------------------------------------------------------
// Function to import Belfast Harbour Cruise Schedule data
// -------------------------------------------------------
export const importBelfastSchedule = async (_req, res) => {
  if (belfastImportStatus.status === "running") {
    return res.status(409).json({ error: "Import already in progress" })
  }

  belfastImportStatus = {
    status: "running",
    modDate: null,
    rowCount: 0,
    error: null,
  }
  res.status(202).json({ message: "Import started in background" })

  try {
    const result = await importBelfastScheduleFromPdf()
    belfastImportStatus = {
      status: "complete",
      modDate: result.modDate?.toISOString() ?? null,
      rowCount: result.rowCount,
      error: null,
    }
  } catch (err) {
    console.error("importBelfastSchedule error:", err.message)
    belfastImportStatus = {
      status: "error",
      modDate: null,
      rowCount: 0,
      error: err.message,
    }
  }
}

// -------------------------------------------------------
// Function to get Belfast Harbour Cruise Schedule data
// -------------------------------------------------------
export const getBelfastSchedule = async (req, res) => {
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    const rows = await getDb().all(
      `SELECT s.portarrivalid, s.cruiselinelogo, s.vesseleta, s.vesseletd,
              s.cruiseline, s.berth, s.visitors, s.pdfmodifieddate, s.importedat,
              v.vesselname, v.vessellengthmetre, v.mmsi, v.imo
       FROM belfastharbour_cruise_schedule s
       JOIN vessels v ON v.vesselid = s.vesselid
       WHERE s.vesseleta >= ? AND s.vesseleta < ?
       ORDER BY s.vesseleta`,
      [yesterday.toISOString(), threeMonthsFromNow.toISOString()],
    )

    // Cache each unique logo locally; attach locallogopath to each row
    const logoCache = new Map()
    for (const row of rows) {
      if (row.cruiselinelogo && !logoCache.has(row.cruiselinelogo)) {
        logoCache.set(
          row.cruiselinelogo,
          await ensureLogoCached(row.cruiselinelogo),
        )
      }
      row.locallogopath = logoCache.get(row.cruiselinelogo) ?? null
    }

    res.json({ message: "success", data: rows })
  } catch (err) {
    if (err.message?.includes("does not exist")) {
      return res.json({ message: "success", data: [] })
    }
    console.error("getBelfastSchedule error:", err.message)
    res.status(400).json({ error: err.message })
  }
}
