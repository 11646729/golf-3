import { importBelfastScheduleFromPdf } from "../belfastScheduleImport.js"
import { DatabaseAdapter } from "../databaseUtilities.js"
import { ensureLogoCached } from "../cruiseLineLogoCache.js"

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
