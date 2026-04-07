import moment from "moment"
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
// Prepare empty vessels Table ready to import data
// -------------------------------------------------------
export const createVesselsTable = async (req, res) => {
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
    await createVesselsTableStructure()

    res.status(200).send({ message: "Vessels table prepared successfully" })
  } catch (error) {
    console.error("Error preparing vessels table:", error)
    res.status(500).send({ error: "Error preparing vessels table" })
  }
} // -------------------------------------------------------
// Create vessels Table in the database
// -------------------------------------------------------
const createVesselsTableStructure = async () => {
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
    console.error("Error in createVesselsTableStructure: ", error.message)
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

    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )

    // Now get current location & destination
    var shipPositions = []

    try {
      for (let j = 0; j < arrivals.length; j++) {
        try {
          await page.goto(arrivals[j], {
            waitUntil: "networkidle2",
            timeout: 10000,
          })

          // Paragraph containing position & time reported
          const positionParagraph = await page
            .$eval(
              "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p",
              (el) => el.textContent.trim()
            )
            .catch(() => "")

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
    } finally {
      await page.close()
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
    const browser = await getBrowser()
    const page = await browser.newPage()

    try {
      await page.goto(vessel_url, { waitUntil: "networkidle2", timeout: 30000 })

      const data = await page.evaluate(() => {
        const getTdNext = (label) => {
          const td = Array.from(document.querySelectorAll("td")).find(
            (t) => t.textContent.trim() === label
          )
          return td?.nextElementSibling?.textContent?.trim() ?? ""
        }

        const vessel_title =
          document
            .querySelector(
              "#container > main > section > article > header > h1"
            )
            ?.textContent?.trim() ?? ""

        const coverLink = document.querySelector(
          "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a"
        )

        return {
          vessel_title,
          vessel_photo_title: coverLink?.getAttribute("title") ?? "",
          vessel_photourl_path: coverLink?.getAttribute("href") ?? "",
          vessel_flag: getTdNext("Flag state"),
          vessel_long_operator: getTdNext("Operator"),
          vessel_year_built_temp: getTdNext("Year built"),
          vessel_length_metres_temp: getTdNext("Length (LOA)"),
          vessel_width_metres_temp: getTdNext("Beam (width)"),
          vessel_gross_tonnage_temp: getTdNext("Gross Tonnage"),
          vessel_max_speed_knots_temp: getTdNext("Speed"),
          vessel_typical_passengers: getTdNext("Passengers"),
          vessel_typical_crew_raw: getTdNext("Crew"),
        }
      })

      // Title
      const vessel_title = data.vessel_title

      // Photo Title
      const vessel_photo_title = data.vessel_photo_title

      // Photo Url
      const vessel_photourl =
        "https://www.cruisemapper.com" + data.vessel_photourl_path

      // Vessel Type
      const vessel_type = "Passenger Ship"

      // Vessel Flag
      const vessel_flag = data.vessel_flag || "Not Known"

      // Short Name of Vessel Operator
      const vessel_short_operator = vessel_title.substr(
        0,
        vessel_title.indexOf(" ")
      )

      // Long Name of Vessel Operator
      const vessel_long_operator = data.vessel_long_operator || "Not Known"

      // Year of Build
      let vessel_year_built = data.vessel_year_built_temp.substr(
        0,
        data.vessel_year_built_temp.indexOf("/") - 2
      )
      if (vessel_year_built === "") vessel_year_built = "Not Known"

      // Length of Vessel in metres
      let vessel_length_metres = data.vessel_length_metres_temp.substr(
        0,
        data.vessel_length_metres_temp.indexOf("/") - 3
      )
      vessel_length_metres =
        vessel_length_metres === ""
          ? null
          : parseInt(vessel_length_metres) || null

      // Width of Vessel in metres
      let vessel_width_metres = data.vessel_width_metres_temp.substr(
        0,
        data.vessel_width_metres_temp.indexOf("/") - 3
      )
      vessel_width_metres =
        vessel_width_metres === ""
          ? null
          : parseInt(vessel_width_metres) || null

      // Gross Tonnage of Vessel
      let vessel_gross_tonnage = data.vessel_gross_tonnage_temp.substr(
        0,
        data.vessel_gross_tonnage_temp.indexOf(" ")
      )
      vessel_gross_tonnage =
        vessel_gross_tonnage === ""
          ? null
          : parseInt(vessel_gross_tonnage) || null

      // If No Vessel Average Speed Available
      const vessel_average_speed_knots = null

      // Vessel Maximum Speed
      let vessel_max_speed_knots = data.vessel_max_speed_knots_temp.substr(
        0,
        data.vessel_max_speed_knots_temp.indexOf("/") - 4
      )
      vessel_max_speed_knots =
        vessel_max_speed_knots === ""
          ? null
          : parseFloat(vessel_max_speed_knots) || null

      // Vessel Callsign
      const vessel_callsign = "C6BR5"

      // Typical Number of Passengers
      const vessel_typical_passengers =
        data.vessel_typical_passengers || "Not Known"

      // Typical Number of Crew
      let vessel_typical_crew = data.vessel_typical_crew_raw
      vessel_typical_crew =
        vessel_typical_crew === "" ? null : parseInt(vessel_typical_crew) || null

      // Scrape current position from the position paragraph
      let vessel_current_position_lat = null
      let vessel_current_position_lng = null
      let vessel_current_position_time = "Not Known"

      try {
        // Extract coordinates from the shipCurrentPositionMap JSON in script tags
        const mapPosition = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll("script"))
          for (const script of scripts) {
            const match = script.textContent.match(
              /"shipCurrentPositionMap"\s*:\s*\{([^}]+)\}/
            )
            if (match) {
              const latMatch = match[1].match(/"lat"\s*:\s*([-\d.]+)/)
              const lonMatch = match[1].match(/"lon"\s*:\s*([-\d.]+)/)
              if (latMatch && lonMatch) {
                return {
                  lat: parseFloat(latMatch[1]),
                  lng: parseFloat(lonMatch[1]),
                }
              }
            }
          }
          return null
        })

        if (
          mapPosition &&
          !isNaN(mapPosition.lat) &&
          !isNaN(mapPosition.lng) &&
          mapPosition.lat >= -90 &&
          mapPosition.lat <= 90 &&
          mapPosition.lng >= -180 &&
          mapPosition.lng <= 180
        ) {
          vessel_current_position_lat = mapPosition.lat
          vessel_current_position_lng = mapPosition.lng
        }

        // Calculate AIS reported time from the position paragraph
        const positionParagraph = await page
          .$eval(
            "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p",
            (el) => el.textContent.trim()
          )
          .catch(() => "")

        let secs = 0, mins = 0, hrs = 0
        const secondsMatch = positionParagraph.match(/(\d+)\s+seconds?/)
        const minutesMatch = positionParagraph.match(/(\d+)\s+minutes?/)
        const hoursMatch = positionParagraph.match(/(\d+)\s+hours?/)
        if (secondsMatch) secs = parseInt(secondsMatch[1]) || 0
        if (minutesMatch) mins = parseInt(minutesMatch[1]) || 0
        if (hoursMatch) hrs = parseInt(hoursMatch[1]) || 0

        const aistime = moment
          .utc()
          .subtract(hrs, "hours")
          .subtract(mins, "minutes")
          .subtract(secs, "seconds")
        vessel_current_position_time = new Date(aistime.format()).toISOString()
      } catch (posErr) {
        console.warn("Could not scrape position for", vessel_url, posErr.message)
      }

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
    } finally {
      await page.close()
    }
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
