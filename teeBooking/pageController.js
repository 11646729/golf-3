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

  const daysFromToday = 12 // Today - 2024-11-24T09:41:18.939Z

  // const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
  // const twoWeeksTime = new Date(new Date().getTime() + twoWeeks)
  // console.log(twoWeeksTime) // 2024-12-08T09:40:13.189Z

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
