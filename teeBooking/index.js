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
    let requestedBooking = new Date("2025-01-03T18:10:00.000Z")
    let numberOfPlayers = 1 // Minimum of 1 but normally would be 3
    let numberOfHoles = 9
    let numberOfBuggies = 1

    // Now split requestedBooking date into bookingDateTime object
    const bookingDateTime = new breakdownBookingTimes(requestedBooking)

    if (numberOfPlayers > 2) {
      numberOfBuggies = 2
    }

    if (numberOfPlayers < 1 && numberOfPlayers > 4) {
      console.log("Number of Players is not between 1 & 4")
    }

    if (numberOfHoles != 9 && numberOfHoles != 18) {
      console.log("Number of Holes is not either 9 or 18")
    }

    // runAtSpecificTimeOfDay(browser, requestedBooking)

    // runAtSpecificTimeOfDay(browser, requestedBooking, () => {
    //   // scraperController(browser, requestedBooking)
    // })

    // Pass the browser instance to the scraper controller
    await scraperController(
      browser,
      bookingDateTime,
      numberOfPlayers,
      numberOfHoles,
      numberOfBuggies
    )

    // Now close the browser
    // await browser.close()
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

    // -----------------------------------------------
    // Calculate Calender Month & Year to use in Calendar Control
    // -----------------------------------------------
    var resultInt = parseInt(this.monthsOfTeeBooking - 1, 10) // Adjust because CalendarControl uses 0 for January etc
    this.calendarControlMonth = resultInt.toString()

    this.calendarControlYear = this.yearsOfTeeBooking

    // -----------------------------------------------
    // Calculate Column Number to use in Calendar Control
    // -----------------------------------------------
    // Calculate Column Number to use in Calendar Control
    this.calendarControlColumnNo = requestedBooking.getDay()

    // In Calendar control: Sunday == 7 but getDay() Numbers: Sunday == 0, Monday == 1 to Saturday == 6
    // So adjust for a Sunday
    if (this.calendarControlColumnNo == 0) {
      this.calendarControlColumnNo = 7
    }

    // -----------------------------------------------
    // Calculate Row Number to use in Calendar Control
    // -----------------------------------------------

    // First calculate the day corresponding to the 1st of month
    let text = this.fullDate.toISOString()

    let tempFirstDay =
      text.substring(0, 8) +
      "01T" +
      this.hoursOfTeeBooking +
      ":" +
      this.minutesOfTeeBooking +
      ":" +
      this.secondsOfTeeBooking +
      ".000Z"

    let dayOf1stOfTheMonth = new Date(tempFirstDay).getDay() // 0-6, 0 == Sunday, 3 == Wednesday

    // -----------------------------------
    // Calendar Control Row Calculation
    // -----------------------------------
    let daysIn1stWeek = 0

    if (dayOf1stOfTheMonth == 0) {
      daysIn1stWeek = 1
    }

    if (dayOf1stOfTheMonth == 1) {
      daysIn1stWeek = 7
    }

    if (dayOf1stOfTheMonth == 2) {
      daysIn1stWeek = 6
    }

    if (dayOf1stOfTheMonth == 3) {
      daysIn1stWeek = 5
    }

    if (dayOf1stOfTheMonth == 4) {
      daysIn1stWeek = 4
    }

    if (dayOf1stOfTheMonth == 5) {
      daysIn1stWeek = 3
    }

    if (dayOf1stOfTheMonth == 6) {
      daysIn1stWeek = 2
    }

    if (this.daysOfTeeBooking <= daysIn1stWeek) {
      this.calendarControlRowNo = 1
    }

    if (
      (this.daysOfTeeBooking > daysIn1stWeek) &
      (this.daysOfTeeBooking <= daysIn1stWeek + 7)
    ) {
      this.calendarControlRowNo = 2
    }

    if (
      (this.daysOfTeeBooking > daysIn1stWeek + 7) &
      (this.daysOfTeeBooking <= daysIn1stWeek + 14)
    ) {
      this.calendarControlRowNo = 3
    }

    if (
      (this.daysOfTeeBooking > daysIn1stWeek + 14) &
      (this.daysOfTeeBooking <= daysIn1stWeek + 21)
    ) {
      this.calendarControlRowNo = 4
    }

    if (
      (this.daysOfTeeBooking > daysIn1stWeek + 21) &
      (this.daysOfTeeBooking <= daysIn1stWeek + 28)
    ) {
      this.calendarControlRowNo = 5
    }

    if (this.daysOfTeeBooking > daysIn1stWeek + 28) {
      this.calendarControlRowNo = 6
    }
  }
}

// ------------------------------------------------------------------
