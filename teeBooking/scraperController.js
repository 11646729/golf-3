import {
  pagePreparationObject,
  extractedBookingTimes,
} from "./pagePreparation.js"

const scraperController = async (browserInstance) => {
  // Load Home Web Page
  let pageVariable = await pagePreparationObject.loadHomeWebPage(
    browserInstance
  )

  // Login to Tee Booking section of the Golf Club Web Site
  pageVariable = await pagePreparationObject.loginToTeeBookingSubsystem(
    pageVariable
  )

  const requestedBooking = new Date("2024-12-06T18:00:00.000Z")

  // const daysFromToday = 14
  // const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
  // const requestedBooking = new Date(new Date().getTime() + twoWeeks)
  // console.log("Two Weeks Time: " + requestedBooking.toISOString())

  // --------------------
  // SHOULD BE 00 MINUTES OR EITHER EVERY 10 MINUTES OR EVERY 8 MINUTES IN SUMMER
  // --------------------

  const mins = new extractedBookingTimes(requestedBooking)

  // console.log(mins.fullDate)
  // console.log(mins.minutesOfTeeBooking)
  // console.log(mins.hoursOfTeeBooking)
  // console.log(mins.daysOfTeeBooking)
  // console.log(mins.monthsOfTeeBooking)
  // console.log(mins.yearsOfTeeBooking)

  const numberOfBuggiesRequested = 2

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    mins.daysOfTeeBooking,
    mins.monthsOfTeeBooking,
    mins.yearsOfTeeBooking
  )

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(
    pageVariable,
    mins.minutesOfTeeBooking,
    mins.hoursOfTeeBooking
  )

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
