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

    // Tee Booking Parameters
    let requestedBooking = new Date("2024-12-13T18:00:00.000Z")

    // Now split requestedBooking into bookingDateTime object
    const bookingDateTime = new breakdownBookingTimes(requestedBooking)

    let numberOfPlayingPartners = 0 // Should be 2
    let numberOfHoles = 9
    let numberOfBuggiesRequested = 1

    if (numberOfPlayingPartners >= 2) {
      numberOfBuggiesRequested = 2
    }

    // runAtSpecificTimeOfDay(browser, requestedBooking)

    // runAtSpecificTimeOfDay(browser, requestedBooking, () => {
    //   // scraperController(browser, requestedBooking)
    // })

    // Pass the browser instance to the scraper controller
    await scraperController(
      browser,
      bookingDateTime,
      numberOfPlayingPartners,
      numberOfHoles,
      numberOfBuggiesRequested
    )

    // Now close the browser
    await browser.close()
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err)
  }
})()

// ----------------------------------------------
// This runs a function at a specific time & date
// ----------------------------------------------
const runAtSpecificTimeOfDay = (
  browser,
  requestedBooking
  // browser,
  // requestedBooking,
  // scraperController
) => {
  console.log("Here I am")

  scraperController(browser, requestedBooking)

  // ;(function loop() {
  //   var now = new Date()
  //   if (
  //     now.getDate() === 10 &&
  //     now.getHours() === 20 &&
  //     now.getMinutes() === 45
  //   ) {
  //     console.log("Now: " + now)

  //     //   scraperController(browser, requestedBooking)
  //   }

  //   now = new Date() // allow for time passing
  //   var delay = 60000 - (now % 60000) // exact ms to next minute interval
  //   setTimeout(loop, delay)
  // })()
}

// ------------------------------------------------------------------

export class breakdownBookingTimes {
  constructor(requestedBooking) {
    this.fullDate = requestedBooking

    // Use 00 for seconds & describe as a String
    this.secondsOfTeeBooking = "00"

    // Extract Minutes of Tee Booking and convert to String
    const m = requestedBooking.getMinutes()
    this.minutesOfTeeBooking = ("0" + m).slice(-2)

    // Extract Hours of Tee Booking and convert to String
    const h = requestedBooking.getHours()
    this.hoursOfTeeBooking = ("0" + h).slice(-2)

    // Extract Days of Tee Booking and convert to String
    const d = requestedBooking.getDate()
    this.daysOfTeeBooking = ("0" + d).slice(-2)

    // Extract Months of Tee Booking and convert to String
    const mo = requestedBooking.getMonth() + 1
    this.monthsOfTeeBooking = ("0" + mo).slice(-2)

    // Extract Years of Tee Booking and convert to String
    this.yearsOfTeeBooking = requestedBooking.getFullYear().toString()
    // .slice(-2)
  }
}

// ------------------------------------------------------------------
