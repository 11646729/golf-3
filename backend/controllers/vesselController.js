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
    // PostgreSQL table creation
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

    // Use placeholder syntax that works with PostgreSQL database
    const sql_insert =
      "INSERT INTO vessels (databaseversion, vesselnameurl, vesselname, vesseltitle, vesselurl, vesseltype, vesselflag, vesselshortoperator, vessellongoperator, vesselyearbuilt, vessellengthmetres, vesselwidthmetres, vesselgrosstonnage, vesselaveragespeedknots, vesselmaxspeedknots, vesselaveragedraughtmetres, vesselimonumber, vesselmmsnumber, vesselcallsign, vesseltypicalpassengers, vesseltypicalcrew, currentpositionlng, currentpositionlat, currentpositiontime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await db.run(sql_insert, newVessel)
  } catch (error) {
    console.error("Error in saveVesselDetails: ", error)
  }
}

// -------------------------------------------------------
// Find vesselNameUrl from vessels Table in PostgreSQL database
// -------------------------------------------------------
export const getVesselPosition = async (req, res) => {
  try {
    // Validate input
    if (!req.query.portArrivals) {
      return res.status(400).json({ error: "No port arrivals provided" })
    }

    // Remove duplicates and store Urls in arrivals array
    let portArrivalsParam = req.query.portArrivals

    // Handle both string and array cases
    let arrivals
    if (Array.isArray(portArrivalsParam)) {
      arrivals = Array.from(new Set(portArrivalsParam)).filter(
        (url) => url && url.trim()
      )
    } else if (typeof portArrivalsParam === "string") {
      // If it's a single string, convert to array
      arrivals = portArrivalsParam.trim() ? [portArrivalsParam] : []
    } else {
      return res.status(400).json({ error: "Invalid port arrivals format" })
    }

    if (arrivals.length === 0) {
      return res.status(400).json({ error: "No valid arrival URLs provided" })
    }

    // Now get current location & destination
    var shipPositions = []

    for (let j = 0; j < arrivals.length; j++) {
      try {
        // Fetch the initial data with timeout
        const { data: html } = await axios.get(arrivals[j], {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        })

        // Load up cheerio
        const $ = cheerio.load(html)

        // Paragraph containing position & time reported
        let positionParagraph = $(
          "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p"
        )
          .text()
          .trim()

        if (!positionParagraph) {
          console.warn(`No position paragraph found for ${arrivals[j]}`)
          continue
        }

        // Name of Vessel - safer extraction
        let vesselName = "Unknown"
        if (positionParagraph.includes("is ")) {
          const nameEnd = positionParagraph.indexOf("is ") - 1
          if (nameEnd > 24) {
            vesselName = positionParagraph.substring(24, nameEnd).trim()
          }
        }

        // Reported Position - safer coordinate extraction
        var latitude = null
        var longitude = null

        if (
          positionParagraph.includes("coordinates ") &&
          positionParagraph.includes("/")
        ) {
          try {
            const coordStart = positionParagraph.indexOf("coordinates ") + 12
            const coordEnd = positionParagraph.indexOf(")", coordStart)

            if (coordEnd > coordStart) {
              const coordString = positionParagraph.substring(
                coordStart,
                coordEnd
              )
              const parts = coordString.split("/")

              if (parts.length === 2) {
                latitude = parseFloat(parts[0].trim())
                longitude = parseFloat(parts[1].trim())

                // Validate coordinates
                if (
                  isNaN(latitude) ||
                  isNaN(longitude) ||
                  latitude < -90 ||
                  latitude > 90 ||
                  longitude < -180 ||
                  longitude > 180
                ) {
                  latitude = null
                  longitude = null
                  console.warn(
                    `Invalid coordinates for ${arrivals[j]}: ${coordString}`
                  )
                }
              }
            }
          } catch (coordError) {
            console.warn(
              `Error parsing coordinates for ${arrivals[j]}:`,
              coordError.message
            )
          }
        }

        // AIS Reported Time - safer time extraction
        let secs = 0,
          mins = 0,
          hrs = 0

        try {
          // Extract seconds
          if (positionParagraph.includes("second")) {
            const secondsMatch = positionParagraph.match(/(\d+)\s+seconds?/)
            if (secondsMatch) {
              secs = parseInt(secondsMatch[1]) || 0
            }
          }

          // Extract minutes
          if (positionParagraph.includes("minute")) {
            const minutesMatch = positionParagraph.match(/(\d+)\s+minutes?/)
            if (minutesMatch) {
              mins = parseInt(minutesMatch[1]) || 0
            }
          }

          // Extract hours
          if (positionParagraph.includes("hour")) {
            const hoursMatch = positionParagraph.match(/(\d+)\s+hours?/)
            if (hoursMatch) {
              hrs = parseInt(hoursMatch[1]) || 0
            }
          }
        } catch (timeError) {
          console.warn(
            `Error parsing time for ${arrivals[j]}:`,
            timeError.message
          )
        }

        var aistimestamp = null
        try {
          var aistime = moment
            .utc()
            .subtract(hrs, "hours")
            .subtract(mins, "minutes")
            .subtract(secs, "seconds")
          aistimestamp = new Date(aistime.format())
        } catch (timestampError) {
          console.warn(
            `Error creating timestamp for ${arrivals[j]}:`,
            timestampError.message
          )
          aistimestamp = new Date()
        }

        // Destination - safer extraction
        var destination = "Unknown"
        try {
          if (
            positionParagraph.includes("route to ") &&
            positionParagraph.includes(". The")
          ) {
            var vesselDest = positionParagraph
              .substring(
                positionParagraph.indexOf("route to ") + 9,
                positionParagraph.indexOf(". The")
              )
              .trim()

            if (vesselDest && vesselDest.length > 0) {
              destination =
                vesselDest[0].toUpperCase() +
                vesselDest.substring(1).toLowerCase()
            }
          }
        } catch (destError) {
          console.warn(
            `Error parsing destination for ${arrivals[j]}:`,
            destError.message
          )
        }

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
      } catch (vesselError) {
        console.error(
          `❌ Error processing vessel ${arrivals[j]}:`,
          vesselError.message
        )
        // Continue with next vessel instead of failing completely
        shipPositions.push({
          index: j,
          vesselUrl: arrivals[j],
          vesselName: "Error",
          lat: null,
          lng: null,
          timestamp: new Date(),
          destination: "Unknown",
          error: vesselError.message,
        })
      }
    }

    res.json(shipPositions)
  } catch (error) {
    console.error("Error in getVesselPosition:", error)
    res.status(500).json({
      error: "Failed to get vessel positions",
      message: error.message,
    })
  }
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
