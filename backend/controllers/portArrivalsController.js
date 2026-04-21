import { DatabaseAdapter } from "../databaseUtilities.js"
import { getBrowser } from "../puppeteerBrowser.js"

// Database adapter for PostgreSQL - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/cruise/
// -------------------------------------------------------
export var index = async (req, res) => {
  res.status(200).send({ response: "Port Arrivals Catalog home page" })
}

// -------------------------------------------------------
// Prepare empty portarrivals Table ready to import data
// -------------------------------------------------------
export const createPortArrivalsTable = async (req, res) => {
  try {
    // Check if portarrivals table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'portarrivals'
      )`,
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("portarrivals table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS portarrivals")
    } else {
      console.log(
        "portarrivals table does not exist - creating the empty table",
      )
    }

    // Create the table
    await createPortArrivalsTableStructure()

    res.status(200).send("Port arrivals table prepared successfully")
  } catch (error) {
    console.error("Error preparing port arrivals table:", error)
    res.status(500).send("Error preparing port arrivals table")
  }
}

// -------------------------------------------------------
// Create portarrivals Table in the database
// -------------------------------------------------------
const createPortArrivalsTableStructure = async () => {
  try {
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS portarrivals (
        portarrivalid SERIAL PRIMARY KEY,
        databaseversion TEXT NOT NULL,
        sentencecaseport TEXT NOT NULL,
        portname TEXT NOT NULL,
        portunlocode TEXT NOT NULL,
        portcoordinatelng REAL CHECK( portcoordinatelng >= -180 AND portcoordinatelng <= 180 ),
        portcoordinatelat REAL CHECK( portcoordinatelat >= -90 AND portcoordinatelat <= 90 ),
        cruiseline TEXT,
        cruiselinelogo TEXT,
        vesselshortcruisename TEXT,
        arrivaldate TEXT,
        weekday TEXT,
        vesseleta TEXT,
        vesseletatime TEXT,
        vesseletd TEXT,
        vesseletdtime TEXT,
        vesselnameurl TEXT
      )
    `)

    await getDb().run(
      `CREATE INDEX IF NOT EXISTS idx_portarrivals_vesseleta ON portarrivals(vesseleta)`,
    )

    console.log("Empty portarrivals table created")
  } catch (error) {
    console.error("Error in createPortArrivalsTableStructure: ", error.message)
  }
}

// -------------------------------------------------------
// Get all Port Arrivals from database
// Path: localhost:4000/api/cruise/allPortArrivals
// -------------------------------------------------------
export const getPortArrivals = async (req, res, next) => {
  try {
    const db = getDb()
    // Use ISO date strings for better compatibility across databases
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    console.log(
      `Fetching port arrivals between ${yesterday.toISOString()} and ${threeMonthsFromNow.toISOString()}`,
    )

    const sql =
      "SELECT p.*, v.vesselurl FROM portarrivals p LEFT JOIN vessels v ON p.vesselnameurl = v.vesselnameurl WHERE p.vesseleta >= ? AND p.vesseleta < ?"
    let params = [yesterday.toISOString(), threeMonthsFromNow.toISOString()]

    const results = await getDb().all(sql, params)

    // Code here to convert 23:59 to Not Known

    res.json({
      message: "success",
      data: results,
    })
  } catch (error) {
    console.error("Error getting port arrivals:", error)
    res.status(400).json({ error: error.message })
  }
}

// -------------------------------------------------------
// Save Port Arrival details to PostgreSQL database
// -------------------------------------------------------
export const savePortArrival = async (req, res) => {
  try {
    const newPortArrival = req.body

    if (!newPortArrival) {
      return res.status(400).json({ error: "No port arrival data provided" })
    }

    // Count the records in the database
    const countResult = await getDb().get(
      "SELECT COUNT(portarrivalid) AS count FROM portarrivals",
    )
    console.log(`Current port arrivals count: ${countResult.count}`)

    // Use placeholder syntax that works with both databases
    const sql1 =
      "INSERT INTO portarrivals (databaseversion, sentencecaseport, portname, portunlocode, portcoordinatelng, portcoordinatelat, cruiseline, cruiselinelogo, vesselshortcruisename, arrivaldate, weekday, vesseleta, vesseletatime, vesseletd, vesseletdtime, vesselnameurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await getDb().run(sql1, newPortArrival)
    res.json({ message: "Port arrival saved successfully" })
  } catch (error) {
    console.error("Error in savePortArrival: ", error)
    res.status(500).json({ error: error.message })
  }
}

// -------------------------------------------------------
// Internal function to save port arrival (for use within controller)
// -------------------------------------------------------
const savePortArrivalInternal = async (newPortArrival) => {
  try {
    if (!newPortArrival) return

    const sql1 =
      "INSERT INTO portarrivals (databaseversion, sentencecaseport, portname, portunlocode, portcoordinatelng, portcoordinatelat, cruiseline, cruiselinelogo, vesselshortcruisename, arrivaldate, weekday, vesseleta, vesseletatime, vesseletd, vesseletdtime, vesselnameurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await getDb().run(sql1, newPortArrival)
  } catch (error) {
    console.error("Error in savePortArrivalInternal: ", error)
  }
}

// -------------------------------------------------------
// Fetch All Port Arrivals Details
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
export const getAndSavePortArrivals = async (
  scheduledPeriods,
  port,
  portName,
) => {
  let allVesselArrivals = []
  let periodVesselArrivals = []

  let loop = 0
  do {
    const period = String(scheduledPeriods[loop].monthYearString)
    periodVesselArrivals = await getSingleMonthPortArrival(
      period,
      port,
      portName,
    )

    let j = 0
    do {
      allVesselArrivals.push(periodVesselArrivals[j])
      j++
    } while (j < periodVesselArrivals.length)

    loop++
  } while (loop < scheduledPeriods.length)

  return allVesselArrivals
}

// -----------------------------------------------------
// Fetch a Single Port Arrival
// Path: Local function called by getAndSavePortArrivals
// -----------------------------------------------------
export const getSingleMonthPortArrival = async (period, port, portName) => {
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

  const weekdayArray = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]

  // Port Name Associated values
  const port_name = portName
  const portLat = port + "_PORT_LATITUDE"
  const portLng = port + "_PORT_LONGITUDE"
  const portUnLocode = port + "_PORT_UN_LOCODE"

  const sentence_case_port = port
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ")

  const port_un_locode = process.env[portUnLocode]
  const portcoordinateslat = process.env[portLat]
  const portcoordinateslng = process.env[portLng]

  let vesselUrls = []

  for (const item of rows) {
    const {
      vessel_short_cruise_name,
      arrivalDate,
      vessel_eta_time: raw_eta,
      vessel_etd_time: raw_etd,
      cruise_line_logo_url,
      raw_cruise_line,
      vessel_name_url,
    } = item

    // -------------------------------------------------------
    // Expected Time of Arrival
    let vessel_eta_time = raw_eta || "11:59"

    let vessel_eta = Date.parse(arrivalDate + " " + vessel_eta_time + " GMT")
    let a = new Date(vessel_eta)
    vessel_eta = a.toISOString()

    // Expected Weekday of Arrival
    let weekday = weekdayArray[a.getDay()]

    // -------------------------------------------------------
    // Expected Time of Departure
    let vessel_etd_time = raw_etd || "11:59"

    let vessel_etd = Date.parse(arrivalDate + " " + vessel_etd_time + " GMT")
    vessel_etd = new Date(vessel_etd).toISOString()
    // -------------------------------------------------------

    // Name of Cruise Line
    const cruise_line = raw_cruise_line.substr(0, raw_cruise_line.length - 20)

    // Url of Vessel Web Page
    if (
      typeof vessel_name_url === "string" ||
      vessel_name_url instanceof String
    ) {
      vesselUrls.push(vessel_name_url)
    } else {
      console.log("Error, vessel_name_url is not a string")
    }

    const newPortArrival = [
      process.env.DATABASE_VERSION,
      sentence_case_port,
      port_name,
      port_un_locode,
      portcoordinateslng,
      portcoordinateslat,
      cruise_line,
      cruise_line_logo_url,
      vessel_short_cruise_name,
      arrivalDate,
      weekday,
      vessel_eta,
      vessel_eta_time,
      vessel_etd,
      vessel_etd_time,
      vessel_name_url,
    ]

    // Now save in PostgreSQL database
    await savePortArrivalInternal(newPortArrival)
  }

  // Return array of vessel Urls
  return vesselUrls
}

export default savePortArrival
