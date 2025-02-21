import { scraperController } from "./scraperController.js"

export const prepareTimeForBooking = async (browser, booking) => {
  let minutesBeforeBookingTime = 2
  let millisecondsInMinute = 60000

  // ----------------------------------------------------------------------------------------------------------------
  // Calculate time to start program - startProgramAheadOfRequestedBookingMinutes minutes before requestedBookingTime
  // ----------------------------------------------------------------------------------------------------------------
  const splitRunningProgramTime = new startProgramObject(
    booking,
    minutesBeforeBookingTime,
    millisecondsInMinute
  )

  // Split booking into time
  const splitBookingDateTime = new breakdownBookingTime(booking.bookingTime)

  // Split out extended Booking Details e.g. No of Players, Buggies & Holes to play
  const extendedBookingDetails = new extendedBookingObject(booking)

  const calendarControlParameters = new calendarControlParametersForBookingTime(
    splitBookingDateTime
  )

  // New function
  runAtSpecificTimeOfDay(splitRunningProgramTime, splitBookingDateTime)

  // Pass the browser instance to the scraper controller Scheduler
  // scheduleFunctionAtTime(
  //   splitRunningProgramTime,
  //   splitBookingDateTime,
  //   extendedBookingDetails,
  //   calendarControlParameters
  // )

  // scraperController(
  //   browser,
  //   splitBookingDateTime,
  //   extendedBookingDetails,
  //   calendarControlParameters
  // )
}

// ------------------------------------------------------------------

export class startProgramObject {
  constructor(booking, minutesBeforeBookingTime, millisecondsInMinute) {
    this.startProgramTime = new Date(
      booking.bookingTime - minutesBeforeBookingTime * millisecondsInMinute
    )

    this.startRunningProgramHours = new Date(
      booking.bookingTime - minutesBeforeBookingTime * millisecondsInMinute
    ).getHours()
    this.startRunningProgramMinutes = new Date(
      booking.bookingTime - minutesBeforeBookingTime * millisecondsInMinute
    ).getMinutes()
    this.startRunningProgramSeconds = new Date(
      booking.bookingTime - minutesBeforeBookingTime * millisecondsInMinute
    ).getSeconds()
  }
}

// ------------------------------------------------------------------

export class extendedBookingObject {
  constructor(booking) {
    this.numberOfPlayers = booking.noOfPlayers
    this.numberOfHoles = booking.noOfHoles
    this.numberOfBuggies = booking.noOfBuggies
  }
}

// ------------------------------------------------------------------

export class breakdownBookingTime {
  constructor(requestedBookingTime) {
    this.fullDateTime = requestedBookingTime

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
  }
}
// ------------------------------------------------------------------

// -----------------------------------------------
// Calculate Calender Month & Year to use in Calendar Control
// -----------------------------------------------
export class calendarControlParametersForBookingTime {
  constructor(booking) {
    this.calendarControlMonth = parseInt(
      booking.monthsOfTeeBooking - 1,
      10
    ).toString() // Adjust because CalendarControl uses 0 for January etc
    this.calendarControlYear = booking.yearsOfTeeBooking

    // -----------------------------------------------
    // Calculate Column Number to use in Calendar Control
    // -----------------------------------------------

    // First get Day of Week for the requested booking date
    this.calendarControlColumnNo = booking.fullDateTime.getDay()

    // In Calendar control: Sunday == 7 but getDay() Numbers: Sunday == 0, Monday == 1 to Saturday == 6
    // So adjust for a Sunday
    if (this.calendarControlColumnNo == 0) {
      this.calendarControlColumnNo = 7
    }

    // -----------------------------------------------
    // Calculate Row Number to use in Calendar Control
    // -----------------------------------------------
    // First calculate the day corresponding to the 1st of month
    let text = booking.fullDateTime.toISOString()

    let tempFirstDay =
      text.substring(0, 8) +
      "01T" +
      booking.hoursOfTeeBooking +
      ":" +
      booking.minutesOfTeeBooking +
      ":" +
      booking.secondsOfTeeBooking +
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

    if (booking.daysOfTeeBooking <= daysIn1stWeek) {
      this.calendarControlRowNo = 1
    }

    if (
      (booking.daysOfTeeBooking > daysIn1stWeek) &
      (booking.daysOfTeeBooking <= daysIn1stWeek + 7)
    ) {
      this.calendarControlRowNo = 2
    }

    if (
      (booking.daysOfTeeBooking > daysIn1stWeek + 7) &
      (booking.daysOfTeeBooking <= daysIn1stWeek + 14)
    ) {
      this.calendarControlRowNo = 3
    }

    if (
      (booking.daysOfTeeBooking > daysIn1stWeek + 14) &
      (booking.daysOfTeeBooking <= daysIn1stWeek + 21)
    ) {
      this.calendarControlRowNo = 4
    }

    if (
      (booking.daysOfTeeBooking > daysIn1stWeek + 21) &
      (booking.daysOfTeeBooking <= daysIn1stWeek + 28)
    ) {
      this.calendarControlRowNo = 5
    }

    if (booking.daysOfTeeBooking > daysIn1stWeek + 28) {
      this.calendarControlRowNo = 6
    }
  }
}

// ------------------------------------------------------------------

const scheduleFunctionAtTime = (hour, minute, second, callback, ...args) => {
  console.log("Here")

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

const runAtSpecificTimeOfDay = (
  splitRunningProgramTime,
  splitBookingDateTime
  // func
) => {
  // Get the current time
  const now = new Date()

  // Create a date object for the target time today
  const targetTime = splitRunningProgramTime.startProgramTime

  // If the target time has already passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1)
  }

  // Calculate the delay in milliseconds
  // const delay = targetTime - now
  // Test data
  const delay = 10000

  setTimeout(function () {
    // run once
    // func()
    console.log(targetTime)
    console.log(splitBookingDateTime.fullDateTime)
  }, delay)
}

// ------------------------------------------------------------------
