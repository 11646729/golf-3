import axios from "axios"
import * as cheerio from "cheerio"
import moment from "moment"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Prepare empty vessels Table ready to import data
// -------------------------------------------------------
export const prepareEmptyVesselsTable = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_sequence table to check if vessels table exists
    let sql = "SELECT seq FROM sqlite_sequence WHERE name = 'vessels'"

    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("vessels table exists")
        deleteVessels(db)
      } else {
        // Else create table
        console.log("vessels table does not exist")
        createVesselsTable(db)
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
// Create vessels Table in the SQLite Database
// -------------------------------------------------------
export const createVesselsTable = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // IF NOT EXISTS isn't really necessary in next line
    const sql =
      "CREATE TABLE IF NOT EXISTS vessels (vesselid INTEGER PRIMARY KEY AUTOINCREMENT, databaseversion INTEGER, vesselnameurl TEXT NOT NULL, title TEXT NOT NULL, vesseltype TEXT NOT NULL, vesselname TEXT NOT NULL, vesselflag TEXT NOT NULL, vesselshortoperator TEXT NOT NULL, vessellongoperator TEXT NOT NULL, vesselyearbuilt TEXT NOT NULL, vessellengthmetres INTEGER, vesselwidthmetres INTEGER, vesselgrosstonnage INTEGER, vesselaveragespeedknots REAL, vesselmaxspeedknots REAL, vesselaveragedraughtmetres REAL, vesselimonumber INTEGER, vesselmmsnumber INTEGER, vesselcallsign TEXT NOT NULL, vesseltypicalpassengers TEXT, vesseltypicalcrew INTEGER, currentpositionlng REAL CHECK( currentpositionlng >= -180 AND currentpositionlng <= 180 ), currentpositionlat REAL CHECK( currentpositionlat >= -90 AND currentpositionlat <= 90 ), currentpositiontime TEXT)"

    db.run(sql, [], (err) => {
      if (err) {
        return console.error(err.message)
      }
      console.log("Empty vessels table created")
    })
  } catch (e) {
    console.error("Error in createVesselsTable: ", e.message)
  }
}

// -------------------------------------------------------
// Delete all Vessels from SQLite database
// -------------------------------------------------------
export const deleteVessels = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Count the records in the database
    const sql = "SELECT COUNT(vesselid) AS count FROM vessels"

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the vessels table
        const sql1 = "DELETE FROM vessels"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All vessels data deleted")
        })

        // Reset the id number
        const sql2 = "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'vessels'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log("In sqlite_sequence table vessels seq number set to 0")
        })
      } else {
        console.log("vessels table was empty (so no data deleted)")
      }
      // })
    })
  } catch (err) {
    console.error("Error in deleteVessels: ", err.message)
  }
}

// -------------------------------------------------------
// Save Vessel details to SQLite database
// -------------------------------------------------------
export const saveVessel = (newVessel) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  // Guard clause for null Vessel details
  if (db === null) return
  if (newVessel == null) return

  db.serialize(() => {
    // try {
    // Count the records in the database
    let sql = "SELECT COUNT(vesselid) AS count FROM vessels"

    db.run(sql, (err) => {
      if (err) {
        return console.error("Error: ", err.message)
      }
      // console.log("Record Count Before Insertion: ", results.count)
    })

    // Don't change the routine below
    const sql_insert =
      "INSERT INTO vessels (databaseversion, vesselnameurl, title, vesseltype, vesselname, vesselflag, vesselshortoperator, vessellongoperator, vesselyearbuilt, vessellengthmetres, vesselwidthmetres, vesselgrosstonnage, vesselaveragespeedknots, vesselmaxspeedknots, vesselaveragedraughtmetres, vesselimonumber, vesselmmsnumber, vesselcallsign, vesseltypicalpassengers, vesseltypicalcrew, currentpositionlng, currentpositionlat, currentpositiontime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)"

    db.run(sql_insert, newVessel, (err) => {
      if (err) {
        return console.error("Error: ", err.message)
      }
      // console.warn("New id of inserted vessel:", this.lastID)
    })
    // } catch (err) {
    //   console.error("Error in SQLsaveVessel: ", err)
    // }
  })

  // Disconnect from the SQLite database
  closeSqlDbConnection(db)
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
      0,
      positionParagraph.indexOf("current ") - 1
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

  //  console.log(shipPosition)

  res.send(shipPositions)
}

// ----------------------------------------------------------
// Fetch Details of a Single Vessel
// Path: Local function called by importPortArrivalsAndVessels
// ----------------------------------------------------------
export const scrapeVesselDetails = async (vessel_url) => {
  // Fetch the initial data
  const { data: html } = await axios.get(vessel_url)

  // Load up cheerio
  const $ = cheerio.load(html)

  // Title
  let vessel_title = $("#review .title").text().trim()

  // Vessel Type
  let vessel_type = "Passenger Ship"

  // Remove " Review" from title to get vessel_name
  let vessel_name = vessel_title.substring(0, vessel_title.length - 7)

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
  let vessel_short_operator = vessel_title.substr(0, vessel_title.indexOf(" "))

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
    vessel_length_metres = "Not Known"
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
    vessel_width_metres = "Not Known"
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
    vessel_gross_tonnage = "Not Known"
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
  // if (vessel_average_speed_knots == "") {
  let vessel_average_speed_knots = "Not Known"
  // }

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
    vessel_max_speed_knots = "Not Known"
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

  let vessel_current_position_lng = 0.0
  let vessel_current_position_lat = 0.0
  let vessel_current_position_time = "Not Known"

  const scrapedVessel = [
    process.env.DATABASE_VERSION,
    vessel_url,
    vessel_title,
    vessel_type, // From where?
    // vessel_photo,
    // vessel_ais_name,
    vessel_name,
    vessel_flag,
    vessel_short_operator,
    vessel_long_operator,
    vessel_year_built,
    vessel_length_metres,
    vessel_width_metres,
    vessel_gross_tonnage,
    vessel_average_speed_knots,
    vessel_max_speed_knots,
    "7.9",
    "8217881",
    "311000343",
    vessel_callsign, // From where?
    vessel_typical_passengers,
    vessel_typical_crew,
    vessel_current_position_lng,
    vessel_current_position_lat,
    vessel_current_position_time,
  ]

  return scrapedVessel
}

export default saveVessel
