import axios from "axios"
import * as cheerio from "cheerio"
import {
  openSqlDbConnection,
  closeSqlDbConnection,
} from "../databaseUtilities.js"

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
  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Simple SELECT to check if table exists (works for both databases)
    let sql = "SELECT COUNT(*) as count FROM portarrivals"

    db.all(sql, [], (err) => {
      if (err) {
        // Table doesn't exist
        console.log(
          "portarrivals table does not exist - creating the empty table"
        )
        createPortArrivalsTable(db)
      } else {
        // Table exists, drop and recreate to ensure schema is current
        db.run("DROP TABLE IF EXISTS portarrivals", [], (dropErr) => {
          if (dropErr) {
            console.error("Error dropping portarrivals table:", dropErr.message)
          }
          createPortArrivalsTable(db)
        })
      }
    })

    res.send("Returned Data")
  } else {
    console.error("Cannot connect to database")
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Create portarrivals Table in the database
// -------------------------------------------------------
export const createPortArrivalsTable = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // PostgreSQL and SQLite compatible table creation
    const sql = `
      CREATE TABLE IF NOT EXISTS portarrivals (
        portarrivalid SERIAL PRIMARY KEY, 
        databaseversion INTEGER, 
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

    db.run(sql, [], (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Empty portarrivals table created")
    })
  } catch (e) {
    console.error("Error in createPortArrivalsTable: ", e.message)
  }
}

// -------------------------------------------------------
// Delete all Port Arrivals records from database
// -------------------------------------------------------
// export const deletePortArrivals = (db) => {
//   // Guard clause for null Database Connection
//   if (db === null) return

//   try {
//     // Count the records in the database
//     const sql = "SELECT COUNT(portarrivalid) AS count FROM portarrivals"

//     db.all(sql, [], (err, result) => {
//       if (err) {
//         console.error(err.message)
//       }

//       if (result[0].count > 0) {
//         // Delete all the data in the portarrivals table
//         const sql1 = "DELETE FROM portarrivals"

//         db.all(sql1, [], function (err, results) {
//           if (err) {
//             console.error(err.message)
//           }
//           console.log("All portarrivals data deleted")
//         })

//         // Reset sequence for PostgreSQL or SQLite
//         const sql2 = `
//           UPDATE sqlite_sequence SET seq = 0 WHERE name = 'portarrivals';
//           ALTER SEQUENCE portarrivals_portarrivalid_seq RESTART WITH 1;
//         `

//         db.run(sql2, [], (err) => {
//           if (err) {
//             // Don't log error as one of the statements will fail depending on DB type
//             console.log("Sequence reset attempted")
//           }
//         })
//         // } else {
//         //   console.log("portarrivals table was empty (so no data deleted)")
//       }
//     })
//   } catch (err) {
//     console.error("Error in deletePortArrivals function: ", err.message)
//   }
// }

// -------------------------------------------------------
// Get all Port Arrivals from database
// Path: localhost:4000/api/cruise/allPortArrivals
// -------------------------------------------------------
export const getPortArrivals = async (req, res, next) => {
  // Use ISO date strings for better compatibility across databases
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

  const sql =
    "SELECT * FROM portarrivals WHERE vesseleta >= ? AND vesseleta < ?"
  let params = [yesterday.toISOString(), threeMonthsFromNow.toISOString()]

  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      db.all(sql, params, (err, results) => {
        if (err) {
          res.status(400).json({ error: err.message })
          return
        }

        // Code here to convert 23:59 to Not Known

        res.json({
          message: "success",
          data: results,
        })
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Save Port Arrival details to SQLite database
// -------------------------------------------------------
export const savePortArrival = (db, newPortArrival) => {
  // Guard clauses
  if (db === null) return
  if (newPortArrival == null) return

  // TODO
  // Add Notification of change (except End of Month rollover)
  // Details of this Cruise?
  // Current Position - to plot on a map

  try {
    // Count the records in the database
    let sql = "SELECT COUNT(portarrivalid) AS count FROM portarrivals"

    // Must be get to work - db.all doesn't work
    // SHOULD THIS BE run ?
    db.get(sql, (err) => {
      if (err) {
        return console.error(err.message)
      }
    })

    // Use placeholder syntax that works with both databases
    const sql1 =
      "INSERT INTO portarrivals (databaseversion, sentencecaseport, portname, portunlocode, portcoordinatelng, portcoordinatelat, cruiseline, cruiselinelogo, vesselshortcruisename, arrivaldate, weekday, vesseleta, vesseletatime, vesseletd, vesseletdtime, vesselnameurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    db.run(sql1, newPortArrival, (err) => {
      if (err) {
        return console.error("Error: ", err.message)
      }
    })
  } catch (err) {
    console.error("Error in SQLsavePortArrival: ", err)
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
  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  let allVesselArrivals = []
  let periodVesselArrivals = []

  let loop = 0
  do {
    const period = String(scheduledPeriods[loop].monthYearString)
    periodVesselArrivals = await getSingleMonthPortArrival(
      db,
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

  // Disconnect from the database
  closeSqlDbConnection(db)

  return allVesselArrivals
}

// -----------------------------------------------------
// Fetch a Single Port Arrival
// Path: Local function called by getAndSavePortArrivals
// -----------------------------------------------------
export const getSingleMonthPortArrival = async (db, period, port, portName) => {
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

  $(".portItemSchedule tr").each((i, item) => {
    // Ignore the table heading
    if (i > 0) {
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
      savePortArrival(db, newPortArrival)
    }
  })

  // Return array of vessel Urls
  return vesselUrls
}

export default savePortArrival
