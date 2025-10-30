import axios from "axios"
import * as cheerio from "cheerio"
import { DatabaseAdapter } from "../databaseUtilities.js"

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
  res.send({ response: "Port Arrivals Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty portarrivals Table ready to import data
// -------------------------------------------------------
export const prepareEmptyPortArrivalsTable = async (req, res) => {
  try {
    const db = getDb()
    // Check if portarrivals table exists using PostgreSQL system tables
    const tableExists = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'portarrivals'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("portarrivals table exists - dropping and recreating")
      await db.run("DROP TABLE IF EXISTS portarrivals")
    } else {
      console.log(
        "portarrivals table does not exist - creating the empty table"
      )
    }

    // Create the table
    await createPortArrivalsTable()

    res.send("Port arrivals table prepared successfully").status(200)
  } catch (error) {
    console.error("Error preparing port arrivals table:", error)
    res.status(500).send("Error preparing port arrivals table")
  }
}

// -------------------------------------------------------
// Create portarrivals Table in the database
// -------------------------------------------------------
export const createPortArrivalsTable = async () => {
  try {
    const db = getDb()
    // PostgreSQL and SQLite compatible table creation
    const sql = `
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
    `

    await db.run(sql)
    console.log("Empty portarrivals table created")
  } catch (error) {
    console.error("Error in createPortArrivalsTable: ", error.message)
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

    const sql =
      "SELECT * FROM portarrivals WHERE vesseleta >= ? AND vesseleta < ?"
    let params = [yesterday.toISOString(), threeMonthsFromNow.toISOString()]

    const results = await db.all(sql, params)

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
// Save Port Arrival details to SQLite database
// -------------------------------------------------------
export const savePortArrival = async (req, res) => {
  try {
    const newPortArrival = req.body

    if (!newPortArrival) {
      return res.status(400).json({ error: "No port arrival data provided" })
    }

    // Count the records in the database
    const db = getDb()
    const countResult = await db.get(
      "SELECT COUNT(portarrivalid) AS count FROM portarrivals"
    )
    console.log(`Current port arrivals count: ${countResult.count}`)

    // Use placeholder syntax that works with both databases
    const sql1 =
      "INSERT INTO portarrivals (databaseversion, sentencecaseport, portname, portunlocode, portcoordinatelng, portcoordinatelat, cruiseline, cruiselinelogo, vesselshortcruisename, arrivaldate, weekday, vesseleta, vesseletatime, vesseletd, vesseletdtime, vesselnameurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await db.run(sql1, newPortArrival)
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
    const db = getDb()
    if (!newPortArrival) return

    // Use placeholder syntax that works with both databases
    const sql1 =
      "INSERT INTO portarrivals (databaseversion, sentencecaseport, portname, portunlocode, portcoordinatelng, portcoordinatelat, cruiseline, cruiselinelogo, vesselshortcruisename, arrivaldate, weekday, vesseleta, vesseletatime, vesseletd, vesseletdtime, vesselnameurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await db.run(sql1, newPortArrival)
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
  portName
) => {
  let allVesselArrivals = []
  let periodVesselArrivals = []

  let loop = 0
  do {
    const period = String(scheduledPeriods[loop].monthYearString)
    periodVesselArrivals = await getSingleMonthPortArrival(
      period,
      port,
      portName
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

  let html
  try {
    const resp = await axios.get(arrivalUrl)
    html = resp.data
  } catch (err) {
    console.error(
      "getSingleMonthPortArrival axios.get failed for",
      arrivalUrl,
      err?.message || err
    )
    // Return empty list of vessel URLs for this period so importer can continue
    return []
  }

  // load up cheerio
  const $ = cheerio.load(html)

  // let vesselArrival = []
  let vesselUrls = []

  // Get all the table rows and process them
  const rows = $(".portItemSchedule tr").toArray()

  for (let i = 1; i < rows.length; i++) {
    // Start from 1 to ignore table heading
    const item = rows[i]

    // Port Name Associated values
    const port_name = portName
    const portLat = port + "_PORT_LATITUDE"
    const portLng = port + "_PORT_LONGITUDE"
    const portUnLocode = port + "_PORT_UN_LOCODE"

    var sentence_case_port = port
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(" ")

    // Port UN Locode
    const port_un_locode = process.env[portUnLocode]

    // Port Coordinates
    const portcoordinateslat = process.env[portLat]
    const portcoordinateslng = process.env[portLng]

    // Name of Vessel
    const vessel_short_cruise_name = $(item).find("a").text()

    let weekdayArray = new Array(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    )
    // -------------------------------------------------------

    //  Scrape Date of Arrival
    let arrivalDate = $(item)
      .children("td")
      .children("span")
      .html()
      .replace(/,/, "") // Removes the comma

    // -------------------------------------------------------
    // Expected Time of Arrival
    let vessel_eta_time = $(item).children("td").next("td").next("td").html()
    let vessel_eta = ""

    // If No Arrival Time Given
    if (vessel_eta_time == "") {
      vessel_eta_time = "11:59"
    }

    vessel_eta = Date.parse(arrivalDate + " " + vessel_eta_time + " GMT")
    let a = new Date(vessel_eta)
    vessel_eta = a.toISOString()

    // Expected Weekday of Arrival
    let weekday = weekdayArray[a.getDay()]

    // -------------------------------------------------------
    // Expected Time of Departure
    let vessel_etd_time = $(item).children("td").last("td").html()
    let vessel_etd = ""

    if (vessel_etd_time == "") {
      vessel_etd_time = "11:59"
    }

    vessel_etd = Date.parse(arrivalDate + " " + vessel_etd_time + " GMT")
    vessel_etd = new Date(vessel_etd).toISOString()
    // -------------------------------------------------------

    // Url of Cruise Line Logo image
    const cruise_line_logo_url = $(item).find("img").attr("src")

    // Name of Cruise Line
    const raw_cruise_line = $(item).find("img").attr("title")
    const cruise_line = raw_cruise_line.substr(0, raw_cruise_line.length - 20)

    // Url of Vessel Web Page
    const vessel_name_url = $(item).find("a").attr("href")
    if (
      typeof vessel_name_url === "string" ||
      vessel_name_url instanceof String
    ) {
      // it's a string
      vesselUrls.push(vessel_name_url)
    }
    // it's something else
    else console.log("Error, vessel_name_url is not a string")

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

    // Now save in SQLite
    await savePortArrivalInternal(newPortArrival)
  }

  // Return array of vessel Urls
  return vesselUrls
}

export default savePortArrival
