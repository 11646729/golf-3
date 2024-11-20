import "dotenv/config.js"

// const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

export const pagePreparationObject = {
  // ------------------------------------------------------------------

  async loadHomeWebPage(browserInstance) {
    // Url of Golf Club Home Web Page
    const urlString = process.env.GOLF_CLUB_HOME_URL

    // Assign browserInstance to browser variable
    let browser = await browserInstance

    // // Load Browser Instance
    let page = await browser.newPage()

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15"
    )

    // Navigate to Initial Web page & wait for it to load
    await page.goto(urlString, { waitUntil: "load" })
    console.log(`Opened ${urlString} ...`)

    return page
  },

  // ------------------------------------------------------------------

  async loginToTeeBookingSubsystem(pageInstance) {
    // Enter Username & Password
    await pageInstance.waitForSelector("#memberid")
    await pageInstance.type("#memberid", process.env.MEMBERID)

    await pageInstance.waitForSelector("#pin")
    await pageInstance.type("#pin", process.env.PIN)

    // Submit the Login form and wait for process to complete
    await Promise.all([
      // await pageInstance.waitForSelector('.btn[type="submit"]'),
      await pageInstance.click('.btn[type="submit"]'),
      pageInstance.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In To Tee Booking Subsystem ...`),
    ])

    // Load Today's Date for Golf Club Tee Booking Subsystem
    await pageInstance.goto(process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM, {
      waitUntil: "load",
    })

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

    const dateTomorrowArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(3) > i"
    await pageInstance.waitForSelector(dateTomorrowArrow)
    await pageInstance.click(dateTomorrowArrow)

    const dateBeforeArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(1) > i"
    await pageInstance.waitForSelector(dateBeforeArrow)
    await pageInstance.click(dateBeforeArrow)

    // Scroll to 11:00 tee time
    // Locating the target element using a selector
    const targetElement = await pageInstance.$(
      "#member_teetimes > tbody > tr:nth-child(27)"
      // ".slot-time.teetime_mins_00.teetime_hours_18"
    )

    // Scrolling the target element into view
    await targetElement.scrollIntoView({ behavior: "smooth", block: "center" })

    // Check if bookTeeTime button exists
    const dateToday =
      "#member_teetimes > tbody > tr:nth-child(27) > td.slot-actions > a"
    // ".slot-time.teetime_mins_00.teetime_hours_18 > td.slot-actions > a"
    await pageInstance.waitForSelector(dateToday)
    await pageInstance.click(dateToday)
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
