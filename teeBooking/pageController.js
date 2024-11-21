import { pagePreparationObject } from "./pagePreparation.js"
// import { pageScraperObject } from "./pageScraper.js"

const scraperController = async (browserInstance) => {
  // Load Home Web Page
  let pageVariable = await pagePreparationObject.loadHomeWebPage(
    browserInstance
  )

  // Login to Tee Booking section of the Golf Club Web Site
  pageVariable = await pagePreparationObject.loginToTeeBookingSubsystem(
    pageVariable
  )

  // Navigate to Tee Booking Page 14 Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(pageVariable)

  // Scroll to Tee Slot that we want to target for booking
  // await pagePreparationObject.scrollToTeeBookingDateTime(pageVariable)

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
