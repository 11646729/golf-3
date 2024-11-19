import "dotenv/config.js"
import moment from "moment"

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))
export const pagePreparationObject = {
  async loadInitialWebPage(browserInstance, urlString) {
    // Assign browserInstance to browser variable
    let browser = await browserInstance

    // // Load Browser Instance
    let page = await browser.newPage()

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15"
    )

    // Navigate to Initial Web page & wait for it to load
    await page.goto(urlString, { waitUntil: "load" })
    console.log(`Navigated to ${urlString} ...`)

    return page
  },

  // ------------------------------------------------------------------

  async login(pageInstance) {
    // Enter Username & Password
    await pageInstance.waitForSelector("#memberid")
    await pageInstance.type("#memberid", process.env.MEMBERID)

    await pageInstance.waitForSelector("#pin")
    await pageInstance.type("#pin", process.env.PIN)

    // Submit the Login form and wait for process to complete
    await Promise.all([
      await pageInstance.click('.btn[type="submit"]'),
      pageInstance.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In ...`),
    ])

    // let hasLoadMoreButton = true

    // // Now load more data
    // const loadMoreButtonString =
    //   "#myteetimes > table > tbody > tr:nth-child(7) > td > a"
    // const loadMoreButton = await pageInstance.$(loadMoreButtonString)

    // if (hasLoadMoreButton) {
    //   console.log("Tee Booking Button exists")

    const bookingUrl = "https://www.cgc-ni.com/memberbooking/"
    await pageInstance.goto(bookingUrl, { waitUntil: "load" })
    // }

    // Scroll to 11:00 tee time
    // Locating the target element using a selector
    const targetElement = await pageInstance.$(
      "#member_teetimes > tbody > tr:nth-child(27)"
    )

    // Scrolling the target element into view
    await targetElement.scrollIntoView({ behavior: "smooth", block: "center" })

    return pageInstance
  },

  // ------------------------------------------------------------------

  async loadTodaysTeeBookingPage(pageInstance) {
    // Goto booking page 14 days ahead of today
    const bookingDate = await addTwoWeeks()

    // Click on today's date to dropdown calendar if it exists
    await pageInstance.waitForSelector(".datepicker.hasDatepicker")

    await pageInstance.$eval(
      ".datepicker.hasDatepicker",
      (el, value) => (el.value = value),
      bookingDate
    )

    // const dateToday = ".datepicker.hasDatepicker"
    // await pageInstance.waitForSelector(dateToday)
    // await pageInstance.click(dateToday)

    const dateTomorrowArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(3) > i"
    await pageInstance.waitForSelector(dateTomorrowArrow)
    await pageInstance.click(dateTomorrowArrow)

    const dateBeforeArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(1) > i"
    await pageInstance.waitForSelector(dateBeforeArrow)
    await pageInstance.click(dateBeforeArrow)
  },
}
// ------------------------------------------------------------------

const addTwoWeeks = async () => {
  const twoWeeks = 1000 * 60 * 60 * 24 * 14
  const twoWeeksTime = new Date(new Date().getTime() + twoWeeks)
  const bookingDate =
    ("0" + twoWeeksTime.getDate()).slice(-2) +
    "-" +
    ("0" + (twoWeeksTime.getMonth() + 1)).slice(-2) +
    "-" +
    twoWeeksTime.getFullYear()

  return bookingDate

  // ------------------------------------------------------------------
}
