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

  const requestedTeeBookingTime = new Date.now()
  console.log(requestedTeeBookingTime)
  const daysFromToday = 13

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(
    pageVariable,
    daysFromToday
  )

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(pageVariable)

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
