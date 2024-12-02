import {
  pagePreparationObject,
  breakdownBookingTimes,
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

  const requestedBooking = new Date("2024-12-13T18:00:00.000Z")

  // const daysFromToday = 14
  // const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
  // const requestedBooking = new Date(new Date().getTime() + twoWeeks)
  // console.log("Two Weeks Time: " + requestedBooking.toISOString())

  // --------------------
  // SHOULD BE 00 MINUTES OR EITHER EVERY 10 MINUTES OR EVERY 8 MINUTES IN SUMMER
  // --------------------

  const bookingDateTime = new breakdownBookingTimes(requestedBooking)

  // console.log(bookingDateTime.fullDate)
  // console.log(bookingDateTime.minutesOfTeeBooking)
  // console.log(bookingDateTime.hoursOfTeeBooking)
  // console.log(bookingDateTime.daysOfTeeBooking)
  // console.log(bookingDateTime.monthsOfTeeBooking)
  // console.log(bookingDateTime.yearsOfTeeBooking)

  const numberOfBuggiesRequested = 2

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    bookingDateTime.daysOfTeeBooking,
    bookingDateTime.monthsOfTeeBooking,
    bookingDateTime.yearsOfTeeBooking
  )

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(
    pageVariable,
    bookingDateTime.minutesOfTeeBooking,
    bookingDateTime.hoursOfTeeBooking
  )

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
