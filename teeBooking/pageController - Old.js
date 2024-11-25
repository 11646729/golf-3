import { pagePreparationObject } from "./pagePreparation.js"

const scraperController = async (browserInstance) => {
  // Load Home Web Page
  let pageVariable = await pagePreparationObject.loadHomeWebPage(
    browserInstance
  )

  // Login to Tee Booking section of the Golf Club Web Site
  pageVariable = await pagePreparationObject.loginToTeeBookingSubsystem(
    pageVariable
  )

  const daysFromToday = 14

  const requestedBooking = new Date("2024-12-09T18:00:00.000Z")

  // Extract Minutes of Tee Booking and convert to String of 2 chars length
  const m = requestedBooking.getMinutes()
  const minutesOfTeeBooking = ("0" + m).slice(-2)

  // Extract Days of Tee Booking and convert to String
  const daysOfTeeBooking = requestedBooking.getDate().toString()

  // Extract Hours of Tee Booking and convert to String
  const hoursOfTeeBooking = requestedBooking.getHours().toString()

  const mo = requestedBooking.getMonth() + 1
  const monthsOfTeeBooking = ("0" + mo).slice(-2)

  const yearsOfTeeBooking = requestedBooking.getFullYear().toString().slice(-2)

  // console.log("Minutes is: " + minutesOfTeeBooking)
  // console.log("Hours is: " + hoursOfTeeBooking)
  // console.log("Days is: " + daysOfTeeBooking)
  // console.log("Months is: " + monthsOfTeeBooking)
  // console.log("Years is: " + yearsOfTeeBooking)

  const numberOfBuggiesRequested = 2

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    yearsOfTeeBooking,
    daysOfTeeBooking,
    daysFromToday
  )

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(
    pageVariable,
    minutesOfTeeBooking,
    hoursOfTeeBooking
  )

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
