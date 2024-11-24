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

  const daysFromToday = 12

  const requestedBooking = new Date("2024-12-06T18:00:00.000Z")

  // Extract Hours of Tee Booking and convert to String
  const h = requestedBooking.getHours()
  const hoursOfTeeBooking = h.toString()

  // Extract Minutes of Tee Booking and convert to String of 2 chars length
  const m = requestedBooking.getMinutes()
  const minutesOfTeeBooking = ("0" + m).slice(-2)

  const numberOfBuggiesRequested = 2

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    daysFromToday
  )

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(
    pageVariable,
    hoursOfTeeBooking,
    minutesOfTeeBooking
  )

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
