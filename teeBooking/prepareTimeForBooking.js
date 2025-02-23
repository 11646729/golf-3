import { scraperController } from "./scraperController.js"

export const prepareTimeForBooking = async (
  browser,
  minutesBeforeBookingTime,
  millisecondsInMinute,
  teeBookingTime,
  noOfPlayers,
  noOfHoles,
  noOfBuggies
) => {
  const myExtendedBookingObject = new extendedBookingObject(
    teeBookingTime,
    noOfPlayers,
    noOfHoles,
    noOfBuggies
  )

  // Create Calendar Control pPrameters
  const myCalendarControlObject = new calendarControlObject(
    myExtendedBookingObject,
    minutesBeforeBookingTime,
    millisecondsInMinute
  )

  // Pass the browser instance to the scraper controller Scheduler
  runAtSpecificTimeOfDay(
    browser,
    myExtendedBookingObject,
    myCalendarControlObject
  )
}

// ------------------------------------------------------------------

export class extendedBookingObject {
  constructor(teeBookingTime, noOfPlayers, noOfHoles, noOfBuggies) {
    this.requestedTeeBookingTime = teeBookingTime

    this.numberOfPlayers = noOfPlayers
    this.numberOfHoles = noOfHoles
    this.numberOfBuggies = noOfBuggies

    // Use 00 for seconds & describe as a String
    this.secondsOfTeeBooking = "00"

    // Extract Minutes of Tee Booking and convert to String
    const m = teeBookingTime.getMinutes()
    this.minutesOfTeeBooking = ("0" + m).slice(-2)

    // Extract Hours of Tee Booking and convert to String
    const h = teeBookingTime.getHours()
    this.hoursOfTeeBooking = ("0" + h).slice(-2)

    // Extract Days of Tee Booking and convert to String
    const d = teeBookingTime.getDate()
    this.daysOfTeeBooking = ("0" + d).slice(-2)

    // Extract Months of Tee Booking and convert to String
    const mo = teeBookingTime.getMonth() + 1
    this.monthsOfTeeBooking = ("0" + mo).slice(-2)

    // Extract Years of Tee Booking and convert to String
    this.yearsOfTeeBooking = teeBookingTime.getFullYear().toString()
  }
}

// -----------------------------------------------
// Calculate Calender Month & Year to use in Calendar Control
// -----------------------------------------------
export class calendarControlObject {
  constructor(
    myExtendedBookingObject,
    minutesBeforeBookingTime,
    millisecondsInMinute
  ) {
    this.startProgramTime = new Date(
      myExtendedBookingObject.requestedTeeBookingTime -
        minutesBeforeBookingTime * millisecondsInMinute
    )
    this.startRunningProgramHours = new Date(
      myExtendedBookingObject.requestedTeeBookingTime -
        minutesBeforeBookingTime * millisecondsInMinute
    ).getHours()
    this.startRunningProgramMinutes = new Date(
      myExtendedBookingObject.requestedTeeBookingTime -
        minutesBeforeBookingTime * millisecondsInMinute
    ).getMinutes()
    this.startRunningProgramSeconds = new Date(
      myExtendedBookingObject.requestedTeeBookingTime -
        minutesBeforeBookingTime * millisecondsInMinute
    ).getSeconds()

    this.calendarControlMonth = parseInt(
      myExtendedBookingObject.monthsOfTeeBooking - 1,
      10
    ).toString() // Adjust because CalendarControl uses 0 for January etc
    this.calendarControlYear = myExtendedBookingObject.yearsOfTeeBooking

    // -----------------------------------------------
    // Calculate Column Number to use in Calendar Control
    // -----------------------------------------------

    // First get Day of Week for the requested booking date
    this.calendarControlColumnNo =
      myExtendedBookingObject.requestedTeeBookingTime.getDay()

    // In Calendar control: Sunday == 7 but getDay() Numbers: Sunday == 0, Monday == 1 to Saturday == 6
    // So adjust for a Sunday
    if (this.calendarControlColumnNo == 0) {
      this.calendarControlColumnNo = 7
    }

    // -----------------------------------------------
    // Calculate Row Number to use in Calendar Control
    // -----------------------------------------------
    // First calculate the day corresponding to the 1st of month
    let text = myExtendedBookingObject.requestedTeeBookingTime.toISOString()

    let tempFirstDay =
      text.substring(0, 8) +
      "01T" +
      myExtendedBookingObject.hoursOfTeeBooking +
      ":" +
      myExtendedBookingObject.minutesOfTeeBooking +
      ":" +
      myExtendedBookingObject.secondsOfTeeBooking +
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

    if (myExtendedBookingObject.daysOfTeeBooking <= daysIn1stWeek) {
      this.calendarControlRowNo = 1
    }

    if (
      (myExtendedBookingObject.daysOfTeeBooking > daysIn1stWeek) &
      (myExtendedBookingObject.daysOfTeeBooking <= daysIn1stWeek + 7)
    ) {
      this.calendarControlRowNo = 2
    }

    if (
      (myExtendedBookingObject.daysOfTeeBooking > daysIn1stWeek + 7) &
      (myExtendedBookingObject.daysOfTeeBooking <= daysIn1stWeek + 14)
    ) {
      this.calendarControlRowNo = 3
    }

    if (
      (myExtendedBookingObject.daysOfTeeBooking > daysIn1stWeek + 14) &
      (myExtendedBookingObject.daysOfTeeBooking <= daysIn1stWeek + 21)
    ) {
      this.calendarControlRowNo = 4
    }

    if (
      (myExtendedBookingObject.daysOfTeeBooking > daysIn1stWeek + 21) &
      (myExtendedBookingObject.daysOfTeeBooking <= daysIn1stWeek + 28)
    ) {
      this.calendarControlRowNo = 5
    }

    if (myExtendedBookingObject.daysOfTeeBooking > daysIn1stWeek + 28) {
      this.calendarControlRowNo = 6
    }
  }
}

// ------------------------------------------------------------------

const runAtSpecificTimeOfDay = (
  browser,
  myExtendedBookingObject,
  myCalendarControlObject
) => {
  // Get the current time
  const now = new Date()

  // Create a date object for the target time today
  const targetTime = myCalendarControlObject.startProgramTime

  // If the target time has already passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1)
  }

  // Calculate the delay in milliseconds
  // const delay = targetTime - now
  // Test data
  const delay = 10000

  setTimeout(function () {
    // scraperController(
    //   browser,
    //   myExtendedBookingObject,
    //   myCalendarControlObject
    // )

    console.log(targetTime)
    console.log(myExtendedBookingObject.requestedTeeBookingTime)
  }, delay)
}

// ------------------------------------------------------------------
