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
    let requestedBooking = new Date("2024-12-22T18:00:00.000Z")

    // -----------------------------------
    // Calendar Control COLUMN Calculation
    // -----------------------------------

    // console.log(requestedBooking.getDay()) // 0-6, 0 == Sunday, 3 == Wednesday
    // In Calendar control Sunday == 7 not 0 but Numbers 1 == Monday to 6 == Saturday
    // This corresponds to column in Calendar control
    // e.g. Wed 25th Dec 2024 is a Wednesday = 3 from getDay() and this equals column 3 in the Calendar control

    // -----------------------------------
    // Calendar Control ROW Calculation
    // -----------------------------------

    // Calculate Day corresponding to the 1st of month

    // // If 1st day of month is Sunday then Days in 1st Week = 1
    // // If 1st day of month is Monday then Days in 1st Week = 7
    // // If 1st day of month is Tuesday then Days in 1st Week = 6
    // // If 1st day of month is Wednesday then Days in 1st Week = 5
    // // If 1st day of month is Thursday then Days in 1st Week = 4
    // // If 1st day of month is Friday then Days in 1st Week = 3
    // // If 1st day of month is Saturday then Days in 1st Week = 2

    // if RequestedDay <= Days in 1st Week then ROWS = 1
    // if RequestedDay > Days in 1st Week & <= [(Days in 1st Week) + 7] then ROWS = 2
    // if RequestedDay > [(Days in 1st Week) + 7] & <= [(Days in 1st Week) + 14] then ROWS = 3
    // if RequestedDay > [(Days in 1st Week) + 14] & <= [(Days in 1st Week) + 21] then ROWS = 4
    // if RequestedDay > [(Days in 1st Week) + 21] & <= [(Days in 1st Week) + 28] then ROWS = 5
    // if RequestedDay > [(Days in 1st Week) + 28] then ROWS = 6

    // Now split requestedBooking into bookingDateTime object
    const bookingDateTime = new breakdownBookingTimes(requestedBooking)

    console.log(bookingDateTime)

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

    // Calculate Column Number to use in Calendar Control
    let day = requestedBooking.getDay() // 0-6, 0 == Sunday, 3 == Wednesday

    // In Calendar control Sunday == 7 not 0 but Numbers 1 == Monday to 6 == Saturday
    // This corresponds to column in Calendar control
    // e.g. Wed 25th Dec 2024 is a Wednesday = 3 from getDay() and this equals column 3 in the Calendar control
    if (day == 0) {
      day = 7
    }

    this.calendarControlColumns = day
  }
}

// ------------------------------------------------------------------
