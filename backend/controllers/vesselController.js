// -------------------------------------------------------
// In-memory job status — reset on each import run
// -------------------------------------------------------
let importStatus = {
  status: "idle", // "idle" | "running" | "complete" | "error"
  phase: null, // "fetching_schedule" | "scraping_arrivals" | "scraping_vessels" | "done"
  arrivalsAdded: 0,
  totalVessels: 0,
  vesselsScraped: 0,
  error: null,
}

export const getImportStatus = () => ({ ...importStatus })

// -------------------------------------------------------
// Get vessel positions from PostgreSQL database
// -------------------------------------------------------
export const getVesselPosition = async (req, res) => {
  try {
    if (!req.query.portArrivals) {
      return res.status(400).json({ error: "No port arrivals provided" })
    }

    const portArrivalsParam = req.query.portArrivals
    let arrivals

    if (Array.isArray(portArrivalsParam)) {
      arrivals = Array.from(new Set(portArrivalsParam)).filter(
        (url) => url && url.trim(),
      )
    } else if (typeof portArrivalsParam === "string") {
      arrivals = portArrivalsParam.trim() ? [portArrivalsParam] : []
    } else {
      return res.status(400).json({ error: "Invalid port arrivals format" })
    }

    if (arrivals.length === 0) {
      return res.status(400).json({ error: "No valid arrival URLs provided" })
    }

    const db = getDb()
    const placeholders = arrivals.map((_, i) => `$${i + 1}`).join(", ")
    const rows = await db.all(
      `SELECT vesselname, vesselnameurl, vesselurl, vesselimonumber, vesselmmsinumber,
              currentpositionlat, currentpositionlng, currentpositiontime
       FROM vessels
       WHERE vesselnameurl IN (${placeholders})`,
      arrivals,
    )

    const shipPositions = arrivals.map((url, index) => {
      const row = rows.find((r) => r.vesselnameurl === url)
      return {
        index,
        vesselUrl: url,
        vesselName: row?.vesselname ?? "Unknown",
        vesselImageUrl: row?.vesselurl ?? null,
        lat: row?.currentpositionlat ?? null,
        lng: row?.currentpositionlng ?? null,
        timestamp: row?.currentpositiontime ?? null,
        imo: row?.vesselimonumber ?? null,
        mmsi: row?.vesselmmsinumber ?? null,
      }
    })

    res.json(shipPositions)
  } catch (error) {
    console.error("Error in getVesselPosition:", error)
    res.status(500).json({
      error: "Failed to get vessel positions",
      message: error.message,
    })
  }
}
