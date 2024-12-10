import puppeteer from "puppeteer"
import { scraperController } from "./scraperController.js"

// ------------------------------------------------------------------
;(async () => {
  try {
    // Start the browser and create a browser instance
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    })

    let requestedBooking = new Date("2024-12-13T18:00:00.000Z")

    // runAtSpecificTimeOfDay(requestedBooking, () => {
    //   scraperController(browser, requestedBooking)
    // })

    // Pass the browser instance to the scraper controller
    await scraperController(browser, requestedBooking)

    // Now close the browser
    await browser.close()
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err)
  }
})()

// ----------------------------------------------
// This runs a function at a specific time & date
// ----------------------------------------------
const runAtSpecificTimeOfDay = (requestedBooking, cb) => {
  ;(function loop() {
    var now = new Date()
    if (
      now.getDate() === 10 &&
      now.getHours() === 20 &&
      now.getMinutes() === 45
    ) {
      console.log("Now: " + now)

      // cb()
    }

    now = new Date() // allow for time passing
    var delay = 60000 - (now % 60000) // exact ms to next minute interval
    setTimeout(loop, delay)
  })()
}
