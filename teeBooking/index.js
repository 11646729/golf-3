import puppeteer from "puppeteer"
import { scraperController } from "./scraperController.js"

// ------------------------------------------------------------------
;(async () => {
  let validBooking = true
  const t0 = performance.now()
  try {
    // Start the browser and create a browser instance
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    })

    // Requested Tee Booking Parameters
    let requestedBookingTime = new Date("2025-01-30T18:00:00.000Z")
    let startProgramAheadOfRequestedBookingMinutes = 2

    let numberOfPlayers = 1 // Minimum of 1 but normally would be 3
    let numberOfHoles = 9
    let numberOfBuggies = 1 // Minimum of 1 but normally would be 2

    // Validate Requested Tee Booking Parameters
    let validBooking = validateBooking(
      numberOfPlayers,
      numberOfHoles,
      numberOfBuggies
    )

    // Now split requestedBooking date into bookingDateTime object
    const bookingDateTime = new breakdownBookingTime(requestedBookingTime)

    // ----------------------------------------------------------------------------------------------------------------
    // Calculate time to start program - startProgramAheadOfRequestedBookingMinutes minutes before requestedBookingTime
    // ----------------------------------------------------------------------------------------------------------------
    let startProgramTime = new Date(requestedBookingTime)

    startProgramTime.setMinutes(
      requestedBookingTime.getMinutes() -
        startProgramAheadOfRequestedBookingMinutes
    )

    const startProgramHours = startProgramTime.getHours()
    const startProgramMinutes = startProgramTime.getMinutes()
    const startProgramSeconds = startProgramTime.getSeconds()

    // console.log(startProgramHours)
    // console.log(startProgramMinutes)
    // console.log(startProgramSeconds)

    // ------------------------------------------------------------------

    // Pass the browser instance to the scraper controller Scheduler
    // scheduleFunctionAtTime(
    //   startProgramHours,
    //   startProgramMinutes,
    //   startProgramSeconds,
    //   makeBooking,
    //   browser,
    //   bookingDateTime,
    //   numberOfPlayers,
    //   numberOfHoles,
    //   numberOfBuggies
    // )

    // FOR TESTING ONLY - NOT TIMER
    // scraperController(
    //   browser,
    //   bookingDateTime,
    //   numberOfPlayers,
    //   numberOfHoles,
    //   numberOfBuggies
    // )

    const t1 = performance.now()
    console.log(`Call to Start Program ${t1 - t0} milliseconds.`)
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err)
  }
})()

// ------------------------------------------------------------------
// Validate Booking Request Parameters
// ------------------------------------------------------------------
const validateBooking = (numberOfPlayers, numberOfHoles, numberOfBuggies) => {
  let validTest = true

  if (numberOfPlayers > 2) {
    numberOfBuggies = 2
  }

  if (numberOfPlayers < 1 || numberOfPlayers > 4) {
    validTest = false
    console.log("Number of Players is not between 1 & 4")
  }

  if (numberOfHoles != 9 && numberOfHoles != 18) {
    validTest = false
    console.log("Number of Holes is not either 9 or 18")
  }

  if (numberOfBuggies < 1 || numberOfBuggies > 2) {
    validTest = false
    console.log("Number of Buggies is not 1 or 2")
  }

  return validTest
}

// ------------------------------------------------------------------

const scheduleFunctionAtTime = (hour, minute, second, callback, ...args) => {
  // Get the current time
  const now = new Date()

  // Create a date object for the target time today
  const targetTime = new Date()
  targetTime.setHours(hour, minute, second, 0)

  // If the target time has already passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1)
  }

  // Calculate the delay in milliseconds
  const delay = targetTime - now

  // Use setTimeout to schedule the function with parameters
  setTimeout(() => callback(...args), delay)
}

// ------------------------------------------------------------------

// makeBooking function to be called
const makeBooking = async (
  browser,
  bookingDateTime,
  numberOfPlayers,
  numberOfHoles,
  numberOfBuggies
) => {
  scraperController(
    browser,
    bookingDateTime,
    numberOfPlayers,
    numberOfHoles,
    numberOfBuggies
  )
}

// ------------------------------------------------------------------

export class breakdownBookingTime {
  constructor(requestedBookingTime) {
    this.fullDate = requestedBookingTime

    // Use 00 for seconds & describe as a String
    this.secondsOfTeeBooking = "00"

    // Extract Minutes of Tee Booking and convert to String
    const m = requestedBookingTime.getMinutes()
    this.minutesOfTeeBooking = ("0" + m).slice(-2)

    // Extract Hours of Tee Booking and convert to String
    const h = requestedBookingTime.getHours()
    this.hoursOfTeeBooking = ("0" + h).slice(-2)

    // Extract Days of Tee Booking and convert to String
    const d = requestedBookingTime.getDate()
    this.daysOfTeeBooking = ("0" + d).slice(-2)

    // Extract Months of Tee Booking and convert to String
    const mo = requestedBookingTime.getMonth() + 1
    this.monthsOfTeeBooking = ("0" + mo).slice(-2)

    // Extract Years of Tee Booking and convert to String
    this.yearsOfTeeBooking = requestedBookingTime.getFullYear().toString()

    // -----------------------------------------------
    // Calculate Calender Month & Year to use in Calendar Control
    // -----------------------------------------------
    var resultInt = parseInt(this.monthsOfTeeBooking - 1, 10) // Adjust because CalendarControl uses 0 for January etc
    this.calendarControlMonth = resultInt.toString()

    this.calendarControlYear = this.yearsOfTeeBooking

    // -----------------------------------------------
    // Calculate Column Number to use in Calendar Control
    // -----------------------------------------------

    this.calendarControlColumnNo = requestedBookingTime.getDay()

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
