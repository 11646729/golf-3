import { importBelfastScheduleFromPdf } from "../belfastScheduleImport.js"
import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

export const importBelfastSchedule = async (_req, res) => {
  try {
    const result = await importBelfastScheduleFromPdf()
    res.json(result)
  } catch (err) {
    console.error("importBelfastSchedule error:", err.message)
    res.status(500).json({ error: err.message })
  }
}

export const getBelfastSchedule = async (req, res) => {
  try {
    // Ensure the table exists before querying
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS belfastharbour_cruise_schedule (
        id                SERIAL PRIMARY KEY,
        arrivaldate       DATE         NOT NULL,
        departuredate     DATE         NOT NULL,
        eta               TIME         NOT NULL,
        etd               TIME         NOT NULL,
        cruiseline        TEXT         NOT NULL,
        vesselname        TEXT         NOT NULL,
        vessellengthmetre INTEGER,
        berth             TEXT,
        visitors          INTEGER,
        pdfmoddate        TIMESTAMPTZ,
        importedat        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)
    await getDb().run(
      `CREATE INDEX IF NOT EXISTS idx_bhcs_arrivaldate ON belfastharbour_cruise_schedule(arrivaldate)`,
    )

    const rows = await getDb().all(
      `SELECT * FROM belfastharbour_cruise_schedule
       WHERE arrivaldate >= CURRENT_DATE
       ORDER BY arrivaldate, eta`,
    )
    res.json({ message: "success", data: rows })
  } catch (err) {
    console.error("getBelfastSchedule error:", err.message)
    res.status(400).json({ error: err.message })
  }
}
