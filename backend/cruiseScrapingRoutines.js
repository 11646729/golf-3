import * as cheerio from "cheerio"
import dotenv from "dotenv"
import { getAndSavePortArrivals } from "./controllers/portArrivalsController.js"
import {
  saveVesselDetails,
  scrapeVesselDetails,
} from "./controllers/vesselController.js"

// Load environment variables
dotenv.config({ quiet: true })

// -------------------------------------------------------
// Import Port Arrivals & Vessel Details
// -------------------------------------------------------
export const importPortArrivalsAndVessels = async (req, res) => {
  // Get the Port Name & Associated values
  //  let port = req.query.portName.toUpperCase()

  console.log("Importing Port Arrivals & Vessel Details")

  const port = process.env.BELFAST_PORT_NAME.toUpperCase()
  // const port = process.env.GEIRANGER_PORT_NAME.toUpperCase()
  // const port = process.env.BERGEN_PORT_NAME.toUpperCase()
  const portUrl = port + "_PORT_URL"
  const portName = process.env[portUrl]

  // Thirdly get the available Months & Years for chosen Port
  const scheduledPeriods = await getScheduleMonths(portName)

  if (scheduledPeriods.length === 0) {
    console.log("CruiseMapper currently has no ship schedule for Selected Port")
  } else {
    // Fourthly get all the Vessel Arrivals per Month
    let vesselUrls = await getAndSavePortArrivals(
      scheduledPeriods,
      port,
      portName
    )

    // Now remove duplicates and store Urls in DeduplicatedVesselUrlArray array
    const DeduplicatedVesselUrlArray = Array.from(new Set(vesselUrls))

    // Sort array ascending
    DeduplicatedVesselUrlArray.sort()

    let loop = 0
    do {
      // Extract urls for vessels & store in newVessel array
      let scrapedVessel = null
      try {
        scrapedVessel = await scrapeVesselDetails(
          DeduplicatedVesselUrlArray[loop]
        )
      } catch (err) {
        console.error(
          "scrapeVesselDetails failed for ",
          DeduplicatedVesselUrlArray[loop],
          err?.message || err
        )
      }

      if (scrapedVessel) {
        try {
          saveVesselDetails(scrapedVessel)
        } catch (err) {
          console.error("saveVesselDetails failed:", err?.message || err)
        }
      } else {
        console.warn(
          "Skipping vessel due to scrape failure:",
          DeduplicatedVesselUrlArray[loop]
        )
      }

      loop++
    } while (loop < DeduplicatedVesselUrlArray.length)

    // Length of vesselUrls array is the Number of Vessel Arrivals
    console.log(vesselUrls.length + " Port Arrivals added")
    console.log(DeduplicatedVesselUrlArray.length + " Vessels added")
  }
}

// -------------------------------------------------------
// Fetch Year & Months which show Vessel Arrival Data
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
const getScheduleMonths = async (portName) => {
  let scheduledPeriods = []

  let initialPeriod = new Date().toISOString().slice(0, 7)

  let initialUrl =
    process.env.CRUISE_MAPPER_URL +
    portName +
    "?tab=schedule&month=" +
    initialPeriod +
    "#schedule"

  // Fetch the initial html page
  const response = await fetch(initialUrl)
  const data = await response.text()

  // Load cheerio
  const $ = cheerio.load(data)

  $("#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option").each(
    (i, item) => {
      const monthYearString = $(item).attr("value")

      scheduledPeriods.push({
        monthYearString,
      })
    }
  )

  return scheduledPeriods
}
