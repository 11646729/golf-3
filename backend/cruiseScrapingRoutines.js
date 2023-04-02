import axios from "axios"
import * as cheerio from "cheerio"
import { getAndSavePortArrivals } from "./controllers/portArrivalsController.js"
import {
  saveVessel,
  scrapeVesselDetails,
} from "./controllers/vesselController.js"

// -------------------------------------------------------
// Import Port Arrivals & Vessel Details
// Path: Function called in switchBoard
// -------------------------------------------------------
export const importPortArrivalsAndVessels = async (req, res) => {
  // Get the Port Name & Associated values
  //  let port = req.query.portName.toUpperCase()

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
      let scrapedVessel = await scrapeVesselDetails(
        DeduplicatedVesselUrlArray[loop]
      )
      saveVessel(scrapedVessel)

      loop++
    } while (loop < DeduplicatedVesselUrlArray.length)

    // Length of vesselUrls array is the Number of Vessel Arrivals
    console.log(vesselUrls.length + " Port Arrivals added")
    console.log(DeduplicatedVesselUrlArray.length + " Vessels added")
    // res.send(vesselUrls.length + " Port Arrivals added")
  }
}

// -------------------------------------------------------
// Fetch Year & Months which show Vessel Arrival Data
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
const getScheduleMonths = async (portName) => {
  let scheduledPeriods = []

  let initialPeriod = new Date().toISOString().slice(0, 7)
  // console.log(initialPeriod)

  let initialUrl =
    process.env.CRUISE_MAPPER_URL +
    portName +
    "?tab=schedule&month=" +
    initialPeriod +
    "#schedule"

  // Fetch the initial data
  const { data: html } = await axios.get(initialUrl)

  // Load up cheerio
  const $ = cheerio.load(html)

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
