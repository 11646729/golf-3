// import { DatabaseAdapter } from "../databaseUtilities.js"
import { getBrowser } from "../puppeteerBrowser.js"

// // Database adapter for PostgreSQL - created lazily
// let db = null
// const getDb = () => {
//   if (!db) {
//     db = new DatabaseAdapter()
//   }
//   return db
// }

// -------------------------------------------------------
// Prepare empty portarrivals Table ready to import data
// -------------------------------------------------------
// export const createPortArrivalsTable = async (req, res) => {
//   try {
//     // Check if portarrivals table exists using PostgreSQL system tables
//     const tableExists = await getDb().get(
//       `SELECT EXISTS (
//         SELECT FROM information_schema.tables
//         WHERE table_schema = 'public'
//         AND table_name = 'portarrivals'
//       )`,
//     )
//
//     if (tableExists.exists) {
//       // If exists then delete the table and recreate
//       console.log("portarrivals table exists - dropping and recreating")
//       await getDb().run("DROP TABLE IF EXISTS portarrivals")
//     } else {
//       console.log(
//         "portarrivals table does not exist - creating the empty table",
//       )
//     }
//
//     await createPortArrivalsTableStructure()
//
//     res.status(200).send("Port arrivals table prepared successfully")
//   } catch (error) {
//     console.error("Error preparing port arrivals table:", error)
//     res.status(500).send("Error preparing port arrivals table")
//   }
// }

// -------------------------------------------------------
// Create portarrivals Table in the database
// -------------------------------------------------------
// const createPortArrivalsTableStructure = async () => {
//   try {
//     await getDb().run(`
//       CREATE TABLE IF NOT EXISTS portarrivals (
//         portarrivalid SERIAL PRIMARY KEY,
//         cruiselinelogo TEXT,
//         vesselname TEXT,
//         vesseleta TEXT,
//         vesseletd TEXT,
//         vesselnameurl TEXT
//       )
//     `)
//
//     await getDb().run(
//       `CREATE INDEX IF NOT EXISTS idx_portarrivals_vesseleta ON portarrivals(vesseleta)`,
//     )
//
//     console.log("Empty portarrivals table created")
//   } catch (error) {
//     console.error("Error in createPortArrivalsTableStructure: ", error.message)
//   }
// }

// -------------------------------------------------------
// Get all Port Arrivals from database
// Path: localhost:4000/api/cruise/allPortArrivals
// -------------------------------------------------------
// export const getPortArrivals = async (req, res, next) => {
//   try {
//     const db = getDb()
//     // Use ISO date strings for better compatibility across databases
//     const yesterday = new Date()
//     yesterday.setDate(yesterday.getDate() - 1)
//     const threeMonthsFromNow = new Date()
//     threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
//
//     const sql =
//       "SELECT p.*, v.vesselurl FROM portarrivals p LEFT JOIN vessels v ON p.vesselnameurl = v.vesselnameurl WHERE p.vesseleta >= ? AND p.vesseleta < ?"
//     let params = [yesterday.toISOString(), threeMonthsFromNow.toISOString()]
//
//     const results = await getDb().all(sql, params)
//
//     res.json({
//       message: "success",
//       data: results,
//     })
//   } catch (error) {
//     console.error("Error getting port arrivals:", error)
//     res.status(400).json({ error: error.message })
//   }
// }

// -------------------------------------------------------
// Save Port Arrival details to PostgreSQL database
// -------------------------------------------------------
// export const savePortArrival = async (req, res) => {
//   try {
//     const newPortArrival = req.body
//
//     if (!newPortArrival) {
//       return res.status(400).json({ error: "No port arrival data provided" })
//     }
//
//     // Count the records in the database
//     const countResult = await getDb().get(
//       "SELECT COUNT(portarrivalid) AS count FROM portarrivals",
//     )
//     console.log(`Current port arrivals count: ${countResult.count}`)
//
//     const sql1 =
//       "INSERT INTO portarrivals (cruiselinelogo, vesselname, vesseleta, vesseletd, vesselnameurl) VALUES (?, ?, ?, ?, ?)"
//
//     await getDb().run(sql1, newPortArrival)
//     res.json({ message: "Port arrival saved successfully" })
//   } catch (error) {
//     console.error("Error in savePortArrival: ", error)
//     res.status(500).json({ error: error.message })
//   }
// }

// -------------------------------------------------------
// Internal function to save port arrival (for use within controller)
// -------------------------------------------------------
// const savePortArrivalInternal = async (newPortArrival) => {
//   try {
//     if (!newPortArrival) return
//
//     const sql1 =
//       "INSERT INTO portarrivals (cruiselinelogo, vesselname, vesseleta, vesseletd, vesselnameurl) VALUES (?, ?, ?, ?, ?)"
//
//     await getDb().run(sql1, newPortArrival)
//   } catch (error) {
//     console.error("Error in savePortArrivalInternal: ", error)
//   }
// }

// -------------------------------------------------------
// Fetch All Port Arrivals Details
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
export const getAndSavePortArrivals = async (scheduledPeriods, portName) => {
  const allVesselArrivals = []
  for (const { monthYearString } of scheduledPeriods) {
    const arrivals = await getSingleMonthPortArrival(
      String(monthYearString),
      portName,
    )
    allVesselArrivals.push(...arrivals)
  }
  return allVesselArrivals
}

// -----------------------------------------------------
// Fetch a Single Port Arrival
// Path: Local function called by getAndSavePortArrivals
// -----------------------------------------------------
export const getSingleMonthPortArrival = async (period, portName) => {
  let arrivalUrl =
    process.env.CRUISE_MAPPER_URL + portName + "?month=" + period + "#schedule"

  const browser = await getBrowser()
  const page = await browser.newPage()

  let rows = []
  try {
    await page.goto(arrivalUrl, { waitUntil: "networkidle2", timeout: 30000 })

    rows = await page.evaluate(() => {
      const trs = Array.from(
        document.querySelectorAll(".portItemSchedule tr"),
      ).slice(1) // skip header row

      return trs.map((tr) => {
        const tds = Array.from(tr.querySelectorAll("td"))
        const anchor = tr.querySelector("a")
        const img = tr.querySelector("img")
        const span = tds[0]?.querySelector("span")

        return {
          vessel_short_cruise_name: anchor?.textContent?.trim() ?? "",
          arrivalDate: span?.innerHTML?.replace(/,/, "") ?? "",
          vessel_eta_time: tds[2]?.innerHTML?.trim() ?? "",
          vessel_etd_time: tds[tds.length - 1]?.innerHTML?.trim() ?? "",
          cruise_line_logo_url: img?.getAttribute("src") ?? "",
          raw_cruise_line: img?.getAttribute("title") ?? "",
          vessel_name_url: anchor?.getAttribute("href") ?? "",
        }
      })
    })
  } catch (err) {
    console.error(
      "getSingleMonthPortArrival failed for",
      arrivalUrl,
      err?.message || err,
    )
    return []
  } finally {
    await page.close()
  }

  let vesselUrls = []

  for (const item of rows) {
    const {
      vessel_short_cruise_name,
      arrivalDate,
      vessel_eta_time: raw_eta,
      vessel_etd_time: raw_etd,
      cruise_line_logo_url,
      vessel_name_url,
    } = item

    // -------------------------------------------------------
    // Expected Time of Arrival
    let vessel_eta_time = raw_eta || "11:59"

    let vessel_eta = Date.parse(arrivalDate + " " + vessel_eta_time + " GMT")
    let a = new Date(vessel_eta)
    vessel_eta = a.toISOString()

    // -------------------------------------------------------
    // Expected Time of Departure
    let vessel_etd_time = raw_etd || "11:59"

    let vessel_etd = Date.parse(arrivalDate + " " + vessel_etd_time + " GMT")
    vessel_etd = new Date(vessel_etd).toISOString()
    // -------------------------------------------------------

    // Url of Vessel Web Page
    if (
      typeof vessel_name_url === "string" ||
      vessel_name_url instanceof String
    ) {
      vesselUrls.push(vessel_name_url)
    } else {
      console.log("Error, vessel_name_url is not a string")
    }

    // const newPortArrival = [
    //   cruise_line_logo_url,
    //   vessel_short_cruise_name,
    //   vessel_eta,
    //   vessel_etd,
    //   vessel_name_url,
    // ]

    // // Now save in PostgreSQL database
    // await savePortArrivalInternal(newPortArrival)
  }

  // Return array of vessel Urls
  return vesselUrls
}

// export default savePortArrival
