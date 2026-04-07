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
      )`,
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
        vesselimonumber INTEGER,
        vesselmmsinumber INTEGER,
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
      "SELECT COUNT(vesselid) AS count FROM vessels",
    )

    // Use placeholder syntax that works with PostgreSQL database
    const sql_insert =
      "INSERT INTO vessels (databaseversion, vesselnameurl, vesselname, vesseltitle, vesselurl, vesseltype, vesselflag, vesselshortoperator, vessellongoperator, vesselyearbuilt, vessellengthmetres, vesselwidthmetres, vesselgrosstonnage, vesselaveragespeedknots, vesselmaxspeedknots, vesselimonumber, vesselmmsinumber, vesseltypicalpassengers, vesseltypicalcrew, currentpositionlng, currentpositionlat, currentpositiontime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    await db.run(sql_insert, newVessel)
  } catch (error) {
    console.error("Error in saveVesselDetails: ", error)
  }
}

// -------------------------------------------------------
// Get vessel positions from PostgreSQL database
// -------------------------------------------------------
export const getVesselPosition = async (req, res) => {
  try {
    if (!req.query.portArrivals) {
      return res.status(400).json({ error: "No port arrivals provided" })
    }

    const portArrivalsParam = req.query.portArrivals
    let arrivals

    if (Array.isArray(portArrivalsParam)) {
      arrivals = Array.from(new Set(portArrivalsParam)).filter(
        (url) => url && url.trim(),
      )
    } else if (typeof portArrivalsParam === "string") {
      arrivals = portArrivalsParam.trim() ? [portArrivalsParam] : []
    } else {
      return res.status(400).json({ error: "Invalid port arrivals format" })
    }

    if (arrivals.length === 0) {
      return res.status(400).json({ error: "No valid arrival URLs provided" })
    }

    const db = getDb()
    const placeholders = arrivals.map((_, i) => `$${i + 1}`).join(", ")
    const rows = await db.all(
      `SELECT vesselname, vesselnameurl, vesselimonumber, vesselmmsinumber,
              currentpositionlat, currentpositionlng, currentpositiontime
       FROM vessels
       WHERE vesselnameurl IN (${placeholders})`,
      arrivals,
    )

    const shipPositions = arrivals.map((url, index) => {
      const row = rows.find((r) => r.vesselnameurl === url)
      return {
        index,
        vesselUrl: url,
        vesselName: row?.vesselname ?? "Unknown",
        lat: row?.currentpositionlat ?? null,
        lng: row?.currentpositionlng ?? null,
        timestamp: row?.currentpositiontime ?? null,
        imo: row?.vesselimonumber ?? null,
        mmsi: row?.vesselmmsinumber ?? null,
      }
    })

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
// Fetch IMO and MMSI numbers from VesselFinder by vessel name
// ----------------------------------------------------------
const scrapeImoAndMmsiFromVesselFinder = async (vessel_name) => {
  let vfPage = null
  try {
    const browser = await getBrowser()
    vfPage = await browser.newPage()
    const searchUrl = `https://www.vesselFinder.com/vessels?name=${encodeURIComponent(vessel_name)}`
    await vfPage.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 })

    // VesselFinder detail links use the IMO as the path: /vessels/details/XXXXXXX
    const detailPath = await vfPage.evaluate(() => {
      const link = document.querySelector('a[href*="/vessels/details/"]')
      return link ? link.getAttribute("href") : null
    })

    if (!detailPath) {
      console.warn(`No VesselFinder result found for "${vessel_name}"`)
      return { imoNumber: null, mmsiNumber: null }
    }

    const imoMatch = detailPath.match(/\/vessels\/details\/(\d+)/)
    const imoNumber = imoMatch ? parseInt(imoMatch[1]) : null

    // Navigate to detail page to extract MMSI
    await vfPage.goto(`https://www.vesselFinder.com${detailPath}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    const mmsiNumber = await vfPage.evaluate(() => {
      // The detail page shows "IMO / MMSI" as a label with "XXXXXXX / XXXXXXXXX" as value
      // Also appears in body text as "MMSI XXXXXXXXX"
      const bodyText = document.body.innerText
      const match = bodyText.match(/MMSI[\s:/]+(\d{9})/)
      return match ? parseInt(match[1]) : null
    })

    console.log(
      `VesselFinder — "${vessel_name}": IMO ${imoNumber}, MMSI ${mmsiNumber}`,
    )
    return { imoNumber, mmsiNumber }
  } catch (err) {
    console.warn("Could not scrape VesselFinder for", vessel_name, err?.message)
    return { imoNumber: null, mmsiNumber: null }
  } finally {
    if (vfPage) await vfPage.close()
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
            (t) => t.textContent.trim() === label,
          )
          return td?.nextElementSibling?.textContent?.trim() ?? ""
        }

        const vessel_title =
          document
            .querySelector(
              "#container > main > section > article > header > h1",
            )
            ?.textContent?.trim() ?? ""

        const coverLink = document.querySelector(
          "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a",
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
        vessel_title.indexOf(" "),
      )

      // Long Name of Vessel Operator
      const vessel_long_operator = data.vessel_long_operator || "Not Known"

      // Year of Build
      let vessel_year_built = data.vessel_year_built_temp.substr(
        0,
        data.vessel_year_built_temp.indexOf("/") - 2,
      )
      if (vessel_year_built === "") vessel_year_built = "Not Known"

      // Length of Vessel in metres
      let vessel_length_metres = data.vessel_length_metres_temp.substr(
        0,
        data.vessel_length_metres_temp.indexOf("/") - 3,
      )
      vessel_length_metres =
        vessel_length_metres === ""
          ? null
          : parseInt(vessel_length_metres) || null

      // Width of Vessel in metres
      let vessel_width_metres = data.vessel_width_metres_temp.substr(
        0,
        data.vessel_width_metres_temp.indexOf("/") - 3,
      )
      vessel_width_metres =
        vessel_width_metres === ""
          ? null
          : parseInt(vessel_width_metres) || null

      // Gross Tonnage of Vessel
      let vessel_gross_tonnage = data.vessel_gross_tonnage_temp.substr(
        0,
        data.vessel_gross_tonnage_temp.indexOf(" "),
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
        data.vessel_max_speed_knots_temp.indexOf("/") - 4,
      )
      vessel_max_speed_knots =
        vessel_max_speed_knots === ""
          ? null
          : parseFloat(vessel_max_speed_knots) || null

      // IMO and MMSI numbers from VesselFinder
      const { imoNumber: vessel_imo_number, mmsiNumber: vessel_mmsi_number } =
        await scrapeImoAndMmsiFromVesselFinder(vessel_title)

      // Typical Number of Passengers
      const vessel_typical_passengers =
        data.vessel_typical_passengers || "Not Known"

      // Typical Number of Crew
      let vessel_typical_crew = data.vessel_typical_crew_raw
      vessel_typical_crew =
        vessel_typical_crew === ""
          ? null
          : parseInt(vessel_typical_crew) || null

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
              /"shipCurrentPositionMap"\s*:\s*\{([^}]+)\}/,
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
            (el) => el.textContent.trim(),
          )
          .catch(() => "")

        let secs = 0,
          mins = 0,
          hrs = 0
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
        console.warn(
          "Could not scrape position for",
          vessel_url,
          posErr.message,
        )
      }

      const scrapedVessel = [
        process.env.DATABASE_VERSION,
        vessel_url,
        vessel_title,
        vessel_photo_title,
        vessel_photourl,
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
        vessel_imo_number,
        vessel_mmsi_number,
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
      err?.message || err,
    )
    return null
  }
}

export default saveVesselDetails
