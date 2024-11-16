import { pagePreparationObject } from "./pagePreparation.js"
// import { pageScraperObject } from "./pageScraper.js"

const scraperController = async (browserInstance) => {
  // Url of Initial Web Page
  const urlString = "https://www.cgc-ni.com/members_login"

  // Assign browserInstance to browser variable
  let browser = await browserInstance

  // Load Initial Web Page
  let pageVariable = await pagePreparationObject.loadInitialWebPage(
    browser,
    urlString
  )

  // Login to Web Site
  await pagePreparationObject.login(pageVariable)

  // Navigate to Tee Booking Page
  await pagePreparationObject.loadTodaysTeeBookingPage()

  // Close the browser
  await browser.close()
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
