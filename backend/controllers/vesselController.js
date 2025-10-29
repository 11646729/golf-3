import axios from "axios"
import * as cheerio from "cheerio"
import moment from "moment"
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
// Prepare empty vessels Table ready to import data
// -------------------------------------------------------
export const prepareEmptyVesselsTable = async (req, res) => {
  try {
    const db = getDb()
    // Check if vessels table exists using PostgreSQL system tables
    const tableExists = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vessels'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("vessels table exists - dropping and recreating")
      await db.run("DROP TABLE IF EXISTS vessels")
    } else {
      console.log("vessels table does not exist - creating the empty table")
    }

    // Create the table
    await createVesselsTable()

    res.send({ message: "Vessels table prepared successfully" }).status(200)
  } catch (error) {
    console.error("Error preparing vessels table:", error)
    res.status(500).send({ error: "Error preparing vessels table" })
  }
} // -------------------------------------------------------
// Create vessels Table in the database
// -------------------------------------------------------
export const createVesselsTable = async () => {
  try {
    const db = getDb()
    // PostgreSQL and SQLite compatible table creation
    const sql = `
      CREATE TABLE IF NOT EXISTS vessels (
        vesselid SERIAL PRIMARY KEY, 
        databaseversion TEXT NOT NULL, 
        vesselnameurl TEXT NOT NULL, 
        vesselname TEXT NOT NULL, 
        vesseltitle TEXT NOT NULL, 
        vesselurl TEXT NOT NULL, 
        vesseltype TEXT NOT NULL, 
        vesselflag TEXT NOT NULL, 
        vesselshortoperator TEXT NOT NULL, 
        vessellongoperator TEXT NOT NULL, 
        vesselyearbuilt TEXT NOT NULL, 
        vessellengthmetres INTEGER, 
        vesselwidthmetres INTEGER, 
        vesselgrosstonnage INTEGER, 
        vesselaveragespeedknots REAL, 
        vesselmaxspeedknots REAL, 
        vesselaveragedraughtmetres REAL, 
        vesselimonumber INTEGER, 
        vesselmmsnumber INTEGER, 
        vesselcallsign TEXT NOT NULL, 
        vesseltypicalpassengers TEXT, 
        vesseltypicalcrew INTEGER, 
        currentpositionlng REAL CHECK( currentpositionlng >= -180 AND currentpositionlng <= 180 ), 
        currentpositionlat REAL CHECK( currentpositionlat >= -90 AND currentpositionlat <= 90 ), 
        currentpositiontime TEXT
      )
    `

    await db.run(sql)
    console.log("Empty vessels table created")
  } catch (error) {
    console.error("Error in createVesselsTable: ", error.message)
  }
}

// -------------------------------------------------------
// Delete all Vessels from database
// -------------------------------------------------------
// export const deleteVessels = (db) => {
//   // Guard clause for null Database Connection
//   if (db === null) return

//   try {
//     // Count the records in the database
//     const sql = "SELECT COUNT(vesselid) AS count FROM vessels"

//     db.all(sql, [], (err, result) => {
//       if (err) {
//         console.error(err.message)
//       }

//       if (result[0].count > 0) {
//         // Delete all the data in the vessels table
//         const sql1 = "DELETE FROM vessels"

//         db.all(sql1, [], function (err, results) {
//           if (err) {
//             console.error(err.message)
//           }
//           console.log("All vessels data deleted")
//         })

//         // Reset sequence for PostgreSQL or SQLite
//         const sql2 = `
//           UPDATE sqlite_sequence SET seq = 0 WHERE name = 'vessels';
//           ALTER SEQUENCE vessels_vesselid_seq RESTART WITH 1;
//         `

//         db.run(sql2, [], (err) => {
//           if (err) {
//             // Don't log error as one of the statements will fail depending on DB type
//             console.log("Sequence reset attempted")
//           }
//         })
//       } else {
//         console.log("vessels table was empty (so no data deleted)")
//       }
//     })
//   } catch (err) {
//     console.error("Error in deleteVessels: ", err.message)
//   }
// }

// -------------------------------------------------------
// Save Vessel details to database
// -------------------------------------------------------
export const saveVesselDetails = async (newVessel) => {
  try {
    const db = getDb()
    // Guard clause for null Vessel details
    if (!newVessel) return

    // Count the records in the database
    const countResult = await db.get(
      "SELECT COUNT(vesselid) AS count FROM vessels"
    )
    console.log(`Current vessels count: ${countResult.count}`)

    // Use placeholder syntax that works with both databases
    const sql_insert =
      "INSERT INTO vessels (databaseversion, vesselnameurl, vesselname, vesseltitle, vesselurl, vesseltype, vesselflag, vesselshortoperator, vessellongoperator, vesselyearbuilt, vessellengthmetres, vesselwidthmetres, vesselgrosstonnage, vesselaveragespeedknots, vesselmaxspeedknots, vesselaveragedraughtmetres, vesselimonumber, vesselmmsnumber, vesselcallsign, vesseltypicalpassengers, vesseltypicalcrew, currentpositionlng, currentpositionlat, currentpositiontime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await db.run(sql_insert, newVessel)
    console.log("Vessel details saved successfully")
  } catch (error) {
    console.error("Error in saveVesselDetails: ", error)
  }
}

// -------------------------------------------------------
// Find vesselNameUrl from vessels Table from SQLite database
// -------------------------------------------------------
export const getVesselPosition = async (req, res) => {
  // Remove duplicates and store Urls in arrivals array
  const arrivals = Array.from(new Set(req.query.portArrivals))

  // Now get current location & destination
  var shipPositions = []

  var j = 0
  do {
    // Fetch the initial data
    const { data: html } = await axios.get(arrivals[j])

    // Load up cheerio
    const $ = cheerio.load(html) // html

    // Paragraph containing position & time reported
    let positionParagraph = $(
      "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p"
    )
      .text()
      .trim()

    // Name of Vessel
    let vesselName = positionParagraph.substring(
      24,
      positionParagraph.indexOf("is ") - 1
    )

    // Reported Position
    var latitude = Number(
      positionParagraph
        .substring(
          positionParagraph.indexOf("coordinates ") + 12,
          positionParagraph.indexOf("/") - 2
        )
        .trim()
    )
    var longitude = Number(
      positionParagraph
        .substring(
          positionParagraph.indexOf("/") + 2,
          positionParagraph.indexOf(")") - 2
        )
        .trim()
    )

    // AIS Reported Time
    let secs = 0
    if (positionParagraph.includes("second")) {
      var secs1 = positionParagraph.substring(
        positionParagraph.indexOf("second"),
        positionParagraph.indexOf("second") - 2
      )

      secs = secs1.trim()

      if (positionParagraph.includes("seconds")) {
        var secs2 = positionParagraph.substring(
          positionParagraph.indexOf("seconds"),
          positionParagraph.indexOf("seconds") - 3
        )

        secs = secs2.trim()
      }
    }

    let mins = 0
    if (positionParagraph.includes("minute")) {
      var mins1 = positionParagraph.substring(
        positionParagraph.indexOf("minute"),
        positionParagraph.indexOf("minute") - 2
      )

      mins = mins1.trim()

      if (positionParagraph.includes("minutes")) {
        var mins2 = positionParagraph.substring(
          positionParagraph.indexOf("minutes"),
          positionParagraph.indexOf("minutes") - 3
        )

        mins = mins2.trim()
      }
    }

    let hrs = 0
    if (positionParagraph.includes("hour")) {
      var hrs1 = positionParagraph.substring(
        positionParagraph.indexOf("hour"),
        positionParagraph.indexOf("hour") - 2
      )

      hrs = hrs1.trim()

      if (positionParagraph.includes("hours")) {
        var hrs2 = positionParagraph.substring(
          positionParagraph.indexOf("hours"),
          positionParagraph.indexOf("hours") - 3
        )

        hrs = hrs2.trim()
      }
    }

    var aistime = moment
      .utc()
      .subtract(hrs, "hours")
      .subtract(mins, "minutes")
      .subtract(secs, "seconds")

    var aistimestamp = new Date(aistime.format())

    // Destination
    var vesselDest = positionParagraph.substring(
      positionParagraph.indexOf("route to ") + 9,
      positionParagraph.indexOf(". The")
    )

    var destination =
      vesselDest[0].toUpperCase() + vesselDest.substring(1).toLowerCase()

    var shipPosition = {
      index: j,
      vesselUrl: arrivals[j],
      vesselName: vesselName,
      lat: latitude,
      lng: longitude,
      timestamp: aistimestamp,
      destination: destination,
    }

    shipPositions.push(shipPosition)

    j++
  } while (j < arrivals.length)

  res.send(shipPositions)
}

// ----------------------------------------------------------
// Fetch Details of a Single Vessel
// Path: Local function called by importPortArrivalsAndVessels
// ----------------------------------------------------------
export const scrapeVesselDetails = async (vessel_url) => {
  try {
    // Fetch the initial data
    const { data: html } = await axios.get(vessel_url)

    // Load up cheerio
    const $ = cheerio.load(html)

    // Title
    let vessel_title = $("#container > main > section > article > header > h1")
      .text()
      .trim()

    // Photo Title
    const link1 = $(
      "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a"
    ).get(0)
    let vessel_photo_title = link1.attribs.title

    // Photo Url
    const link = $(
      "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a"
    ).get(0)
    let vessel_photourl = "https://www.cruisemapper.com" + link.attribs.href

    // Vessel Type
    let vessel_type = "Passenger Ship"

    // Vessel Flag
    let vessel_flag = $("td")
      .filter(function () {
        return $(this).text().trim() === "Flag state"
      })
      .next()
      .text()
      .trim()

    // If No Vessel Flag Available
    if (vessel_flag == "") {
      vessel_flag = "Not Known"
    }

    // Short Name of Vessel Operator
    let vessel_short_operator = vessel_title.substr(
      0,
      vessel_title.indexOf(" ")
    )

    // Long Name of Vessel Operator
    let vessel_long_operator = $("td")
      .filter(function () {
        return $(this).text().trim() === "Operator"
      })
      .next()
      .text()

    // If No Vessel Operator Available
    if (vessel_long_operator == "") {
      vessel_long_operator = "Not Known"
    }

    // Year of Build
    const vessel_year_built_temp = $("td")
      .filter(function () {
        return $(this).text().trim() === "Year built"
      })
      .next()
      .text()

    let vessel_year_built = vessel_year_built_temp.substr(
      0,
      vessel_year_built_temp.indexOf("/") - 2
    )

    // If No Year of Build Available
    if (vessel_year_built == "") {
      vessel_year_built = "Not Known"
    }

    // Length of Vessel in metres
    const vessel_length_metres_temp = $("td")
      .filter(function () {
        return $(this).text().trim() === "Length (LOA)"
      })
      .next()
      .text()

    let vessel_length_metres = vessel_length_metres_temp.substr(
      0,
      vessel_length_metres_temp.indexOf("/") - 3
    )

    // If No Length of Vessel in metres Available
    if (vessel_length_metres == "") {
      vessel_length_metres = null
    } else {
      vessel_length_metres = parseInt(vessel_length_metres) || null
    }

    // Width of Vessel in metres
    const vessel_width_metres_temp = $("td")
      .filter(function () {
        return $(this).text().trim() === "Beam (width)"
      })
      .next()
      .text()

    let vessel_width_metres = vessel_width_metres_temp.substr(
      0,
      vessel_width_metres_temp.indexOf("/") - 3
    )

    // If No Width of Vessel in metres Available
    if (vessel_width_metres == "") {
      vessel_width_metres = null
    } else {
      vessel_width_metres = parseInt(vessel_width_metres) || null
    }

    // Gross Tonnage of Vessel
    const vessel_gross_tonnage_temp = $("td")
      .filter(function () {
        return $(this).text().trim() === "Gross Tonnage"
      })
      .next()
      .text()

    let vessel_gross_tonnage = vessel_gross_tonnage_temp.substr(
      0,
      vessel_gross_tonnage_temp.indexOf(" ")
    )

    // If No Gross Tonnage of Vessel Available
    if (vessel_gross_tonnage == "") {
      vessel_gross_tonnage = null
    } else {
      vessel_gross_tonnage = parseInt(vessel_gross_tonnage) || null
    }

    // Vessel Average Speed
    // const vessel_average_speed_knots_temp = $("td")
    //   .filter(function() {
    //     return (
    //       $(this)
    //         .text()
    //         .trim() === "Speed"
    //     )
    //   })
    //   .next()
    //   .text()

    // let vessel_average_speed_knots = vessel_average_speed_knots_temp.substr(
    //   0,
    //   vessel_average_speed_knots_temp.indexOf("/") - 4
    // )

    // If No Vessel Average Speed Available
    let vessel_average_speed_knots = null

    // Vessel Maximum Speed
    const vessel_max_speed_knots_temp = $("td")
      .filter(function () {
        return $(this).text().trim() === "Speed"
      })
      .next()
      .text()

    let vessel_max_speed_knots = vessel_max_speed_knots_temp.substr(
      0,
      vessel_max_speed_knots_temp.indexOf("/") - 4
    )

    // If No Vessel Maximum Speed Available
    if (vessel_max_speed_knots == "") {
      vessel_max_speed_knots = null
    } else {
      vessel_max_speed_knots = parseFloat(vessel_max_speed_knots) || null
    }

    // Vessel Callsign
    let vessel_callsign = "C6BR5"

    // Typical Number of Passengers
    let vessel_typical_passengers = $("td")
      .filter(function () {
        return $(this).text().trim() === "Passengers"
      })
      .next()
      .text()

    // If No Typical Number of Passengers Available
    if (vessel_typical_passengers == "") {
      vessel_typical_passengers = "Not Known"
    }

    // Typical Number of Crew
    let vessel_typical_crew = $("td")
      .filter(function () {
        return $(this).text().trim() === "Crew"
      })
      .next()
      .text()

    // If No Typical Number of Crew Available
    if (vessel_typical_crew == "") {
      vessel_typical_crew = null
    } else {
      vessel_typical_crew = parseInt(vessel_typical_crew) || null
    }

    let vessel_current_position_lng = 0.0
    let vessel_current_position_lat = 0.0
    let vessel_current_position_time = "Not Known"

    const scrapedVessel = [
      process.env.DATABASE_VERSION,
      vessel_url, // vesselnameurl
      vessel_title, // vesselname (using title as name)
      vessel_photo_title, // vesseltitle
      vessel_photourl, // vesselurl
      vessel_type,
      vessel_flag,
      vessel_short_operator,
      vessel_long_operator,
      vessel_year_built,
      vessel_length_metres,
      vessel_width_metres,
      vessel_gross_tonnage,
      vessel_average_speed_knots,
      vessel_max_speed_knots,
      7.9, // vesselaveragedraughtmetres (REAL)
      8217881, // vesselimonumber (INTEGER)
      311000343, // vesselmmsnumber (INTEGER)
      vessel_callsign,
      vessel_typical_passengers,
      vessel_typical_crew,
      vessel_current_position_lng,
      vessel_current_position_lat,
      vessel_current_position_time,
    ]

    return scrapedVessel
  } catch (err) {
    console.error(
      "scrapeVesselDetails error for",
      vessel_url,
      err?.message || err
    )
    return null
  }
}

export default saveVesselDetails
