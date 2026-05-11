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
