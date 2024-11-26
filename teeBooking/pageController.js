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

  const requestedBooking = new Date("2024-12-09T18:00:00.000Z")

  // const daysFromToday = 14
  // const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
  // const requestedBooking = new Date(new Date().getTime() + twoWeeks)
  // console.log("Two Weeks Time: " + requestedBooking.toISOString())

  // Extract Minutes of Tee Booking and convert to String of 2 chars length
  const m = requestedBooking.getMinutes()
  const minutesOfTeeBooking = ("0" + m).slice(-2)

  // Extract Days of Tee Booking and convert to String
  const d = requestedBooking.getDate()
  const daysOfTeeBooking = ("0" + d).slice(-2)

  // Extract Hours of Tee Booking and convert to String
  const h = requestedBooking.getHours()
  const hoursOfTeeBooking = ("0" + h).slice(-2)

  // Extract Months of Tee Booking and convert to String
  const mo = requestedBooking.getMonth() + 1
  const monthsOfTeeBooking = ("0" + mo).slice(-2)

  // Extract Years of Tee Booking and convert to String
  const yearsOfTeeBooking = requestedBooking.getFullYear().toString().slice(-2)

  const numberOfBuggiesRequested = 2

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    daysOfTeeBooking,
    monthsOfTeeBooking,
    yearsOfTeeBooking
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
