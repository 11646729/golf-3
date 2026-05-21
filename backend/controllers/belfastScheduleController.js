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
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    const rows = await getDb().all(
      `SELECT b.*, l.logourl AS cruiselinelogo
       FROM belfastharbour_cruise_schedule b
       LEFT JOIN cruiselinelogos l ON b.cruiselinelogoid = l.cruiselinelogoid
       WHERE b.vesseleta >= ? AND b.vesseleta < ?
       ORDER BY b.vesseleta`,
      [yesterday.toISOString(), threeMonthsFromNow.toISOString()],
    )
    res.json({ message: "success", data: rows })
  } catch (err) {
    if (err.message?.includes("does not exist")) {
      return res.json({ message: "success", data: [] })
    }
    console.error("getBelfastSchedule error:", err.message)
    res.status(400).json({ error: err.message })
  }
}
