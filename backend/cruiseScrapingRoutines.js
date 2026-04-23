import dotenv from "dotenv"
import { getBrowser } from "./puppeteerBrowser.js"
import { getAndSavePortArrivals } from "./controllers/portArrivalsController.js"
import {
  saveVesselDetails,
  scrapeVesselDetails,
} from "./controllers/vesselController.js"

// Load environment variables
dotenv.config({ quiet: true })

// -------------------------------------------------------
// In-memory job status — reset on each import run
// -------------------------------------------------------
let importStatus = {
  status: "idle", // "idle" | "running" | "complete" | "error"
  phase: null,    // "fetching_schedule" | "scraping_arrivals" | "scraping_vessels" | "done"
  arrivalsAdded: 0,
  totalVessels: 0,
  vesselsScraped: 0,
  error: null,
}

export const getImportStatus = () => ({ ...importStatus })

// -------------------------------------------------------
// Import Port Arrivals & Vessel Details
// -------------------------------------------------------
export const importPortArrivalsAndVessels = async (_req, res) => {
  console.log("Importing Port Arrivals & Vessel Details")

  importStatus = {
    status: "running",
    phase: "fetching_schedule",
    arrivalsAdded: 0,
    totalVessels: 0,
    vesselsScraped: 0,
    error: null,
  }

  // Respond immediately so the client is not left waiting during the long scrape
  res.status(202).json({ message: "Import started in background" })

  try {
    const port = process.env.BELFAST_PORT_NAME.toUpperCase()
    const portUrl = port + "_PORT_URL"
    const portName = process.env[portUrl]

    // Firstly get the available Months & Years for chosen Port
    const scheduledPeriods = await getScheduleMonths(portName)

    if (scheduledPeriods.length === 0) {
      console.log("CruiseMapper currently has no ship schedule for Selected Port")
      importStatus = { ...importStatus, status: "complete", phase: "done" }
      return
    }

    // Secondly get all the Vessel Arrivals per Month
    importStatus = { ...importStatus, phase: "scraping_arrivals" }
    const vesselUrls = await getAndSavePortArrivals(scheduledPeriods, port, portName)

    // Now remove duplicates and store Urls in DeduplicatedVesselUrlArray array
    const DeduplicatedVesselUrlArray = Array.from(new Set(vesselUrls))
    DeduplicatedVesselUrlArray.sort()

    importStatus = {
      ...importStatus,
      phase: "scraping_vessels",
      arrivalsAdded: vesselUrls.length,
      totalVessels: DeduplicatedVesselUrlArray.length,
      vesselsScraped: 0,
    }

    let loop = 0
    do {
      importStatus = { ...importStatus, vesselsScraped: loop }

      let scrapedVessel = null
      try {
        scrapedVessel = await scrapeVesselDetails(DeduplicatedVesselUrlArray[loop])
      } catch (err) {
        console.error(
          "scrapeVesselDetails failed for ",
          DeduplicatedVesselUrlArray[loop],
          err?.message || err,
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
          DeduplicatedVesselUrlArray[loop],
        )
      }

      loop++
    } while (loop < DeduplicatedVesselUrlArray.length)

    importStatus = {
      ...importStatus,
      status: "complete",
      phase: "done",
      vesselsScraped: DeduplicatedVesselUrlArray.length,
    }

    // Length of vesselUrls array is the Number of Vessel Arrivals
    console.log(vesselUrls.length + " Port Arrivals added")
    console.log(DeduplicatedVesselUrlArray.length + " Vessels added")
  } catch (err) {
    console.error("importPortArrivalsAndVessels background process failed:", err?.message || err)
    importStatus = { ...importStatus, status: "error", error: err?.message || "Unknown error" }
  }
}

// -------------------------------------------------------
// Fetch Year & Months which show Vessel Arrival Data
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
const getScheduleMonths = async (portName) => {
  let initialPeriod = new Date().toISOString().slice(0, 7)

  let initialUrl =
    process.env.CRUISE_MAPPER_URL +
    portName +
    "?tab=schedule&month=" +
    initialPeriod +
    "#schedule"

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(initialUrl, { waitUntil: "networkidle2", timeout: 30000 })

    const scheduledPeriods = await page.$$eval(
      "#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option",
      (options) => options.map((opt) => ({ monthYearString: opt.value })),
    )

    return scheduledPeriods
  } finally {
    await page.close()
  }
}
