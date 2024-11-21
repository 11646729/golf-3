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
    let pageVariable = await browser.newPage()

    await pageVariable.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15"
    )

    // Navigate to Initial Web page & wait for it to load
    await pageVariable.goto(urlString, { waitUntil: "load" })
    console.log(`Opened ${urlString} ...`)

    return pageVariable
  },

  // ------------------------------------------------------------------

  async loginToTeeBookingSubsystem(pageVariable) {
    // Enter Username & Password
    await pageVariable.waitForSelector("#memberid")
    await pageVariable.type("#memberid", process.env.MEMBERID)

    await pageVariable.waitForSelector("#pin")
    await pageVariable.type("#pin", process.env.PIN)

    // Submit the Login form and wait for process to complete
    await Promise.all([
      // await pageInstance.waitForSelector('.btn[type="submit"]'),
      await pageVariable.click('.btn[type="submit"]'),
      pageVariable.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In To Tee Booking Subsystem ...`),
    ])

    // Load Today's Date for Golf Club Tee Booking Subsystem
    await pageVariable.goto(process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM, {
      waitUntil: "load",
    })

    return pageVariable
  },

  // ------------------------------------------------------------------

  async loadTodaysTeeBookingPage(pageVariable) {
    // Number of Days From Today for Booking
    const daysFromToday = 13

    // Goto booking page daysFromToday days ahead of today
    const bookingDate = await addTwoWeeks(daysFromToday)

    // Click on today's date to dropdown calendar if it exists
    await pageVariable.waitForSelector(".datepicker.hasDatepicker")

    await pageVariable.$eval(
      ".datepicker.hasDatepicker",
      (el, value) => (el.value = value),
      bookingDate
    )

    const dateTomorrowArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(3) > i"
    await pageVariable.waitForSelector(dateTomorrowArrow)
    await pageVariable.click(dateTomorrowArrow)

    const dateBeforeArrow =
      "#teetimes_nav_form > div > div:nth-child(1) > div > a:nth-child(1) > i"
    await pageVariable.waitForSelector(dateBeforeArrow)
    await pageVariable.click(dateBeforeArrow)
  },

  // ------------------------------------------------------------------

  async scrollToTeeBookingDateTime(pageVariable) {
    console.log(pageVariable)

    // Scroll to 11:00 tee time
    // Locating the target element using a selector
    const bookTeeSlot =
      "#member_teetimes > tbody > tr.future.bookable.teetime-mins-00.teetime-hours-18.cantreserve.odd > td.slot-actions > a"

    await pageVariable.waitForSelector(bookTeeSlot)
    await pageVariable.click(bookTeeSlot)

    // Select 3 Players
    const numberOfPlayers =
      "#cluetip-inner > div.tipForm > form > fieldset > div:nth-child(1) > div > label:nth-child(3) > input[type=radio]"
    await pageVariable.waitForSelector(numberOfPlayers)
    await pageVariable.click(numberOfPlayers)

    // Select 9 Holes - change label:nth-child(1) to label:nth-child(2) in line below for 18 Holes - WORKS OK
    const numberOfHoles =
      "#cluetip-inner > div.tipForm > form > fieldset > div:nth-child(7) > div > label:nth-child(1) > input[type=radio]"
    await pageVariable.waitForSelector(numberOfHoles)
    await pageVariable.click(numberOfHoles)

    //  Now click Booking Button - THIS WORKS OK
    // const bookTeetime = "#cluetip-inner > div.tipForm > form > button"
    // await pageVariable.waitForSelector(bookTeetime)
    // await pageVariable.click(bookTeetime)
  },
}
// ------------------------------------------------------------------

const addTwoWeeks = async (daysFromToday) => {
  const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
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
