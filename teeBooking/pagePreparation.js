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

  async loadTodaysTeeBookingPage(
    pageVariable,
    yearsOfTeeBooking,
    daysOfTeeBooking,
    bookingDaysFromToday
  ) {
    // Create bookingDate
    const bookingDate = await addTwoWeeks(bookingDaysFromToday)
    console.log("Booking Date: " + bookingDate)

    // Click on today's date to dropdown calendar if it exists
    await pageVariable.waitForSelector(".datepicker.hasDatepicker")

    // Move to display bookingDate e.g. 07-12-24
    // Does this function amend the current-day to be displayed ???
    await pageVariable.$eval(
      ".datepicker.hasDatepicker",
      (el, value) => (el.value = value),
      bookingDate
    )

    // Selects the month for selected bookingDate
    const chooseDatepickerMonth =
      "#teetimes_nav_form > div > div:nth-child(1) > div > span > span.date-display"
    await pageVariable.waitForSelector(chooseDatepickerMonth)
    await pageVariable.click(chooseDatepickerMonth) // Works & drops down calendar for today's date

    // Drops down the monthly calendar for selected bookingDate, moves to the day & clicks it
    const chooseDatepickerDate =
      "#ui-datepicker-div > table > tbody > tr:nth-child(2) > td.ui-datepicker-current-day"
    await pageVariable.waitForSelector(chooseDatepickerDate)
    await pageVariable.click(chooseDatepickerDate)
  },

  // ------------------------------------------------------------------

  async scrollToTeeBookingDateTime(
    pageVariable,
    minutesOfTeeBooking,
    hoursOfTeeBooking
  ) {
    // Bring up the dialog asking for the Number of Players & 9 or 18 Holes
    const bookTeeSlot =
      "#member_teetimes > tbody > tr.future.bookable.teetime-mins-" +
      minutesOfTeeBooking +
      ".teetime-hours-" +
      hoursOfTeeBooking +
      ".cantreserve.odd > td.slot-actions > a"
    await pageVariable.waitForSelector(bookTeeSlot)
    await pageVariable.click(bookTeeSlot)

    // Select 3 Players
    const numberOfPlayers =
      "#cluetip-inner > div.tipForm > form > fieldset > div:nth-child(1) > div > label:nth-child(3) > input[type=radio]"
    await pageVariable.waitForSelector(numberOfPlayers)
    await pageVariable.click(numberOfPlayers)

    // Select 9 Holes - change label:nth-child(1) to label:nth-child(2) in line below for 18 Holes
    const numberOfHoles =
      "#cluetip-inner > div.tipForm > form > fieldset > div:nth-child(7) > div > label:nth-child(1) > input[type=radio]"
    await pageVariable.waitForSelector(numberOfHoles)
    await pageVariable.click(numberOfHoles)

    //  Now click Booking Button to bring up the Booking Details page
    // THIS RESERVES THE TEE BOOKING
    const bookTeetime = "#cluetip-inner > div.tipForm > form > button"
    await pageVariable.waitForSelector(bookTeetime)
    // await pageVariable.click(bookTeetime)

    // // Now click Add Buggy Booking Service link on the Booking Details page
    // const addBuggy =
    //   "#teebooking_info > table > tbody > tr:nth-child(7) > td > a"
    // await pageVariable.waitForSelector(addBuggy)
    // await pageVariable.click(addBuggy)
    // await pageVariable.click(addBuggy)
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
