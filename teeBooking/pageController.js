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

  // Navigate to Tee Booking Page on the Golf Club Web Site
  // await pagePreparationObject.loadTodaysTeeBookingPage(pageVariable)

  // Scroll to Tee Slot that we want to target for booking
  // SEPERATE PROGRAM

  // Close the browser
  // await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
