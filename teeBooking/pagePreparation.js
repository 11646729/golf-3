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
    daysOfTeeBooking,
    monthsOfTeeBooking,
    yearsOfTeeBooking
  ) {
    // Create bookingDate
    const bookingDate =
      daysOfTeeBooking + "-" + monthsOfTeeBooking + "-" + yearsOfTeeBooking

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

    // -----------------------
    // nth-child(?) depends on row containing day
    // -----------------------

    // Drops down the monthly calendar for selected bookingDate, moves to the day & clicks it
    const chooseDatepickerDate =
      "#ui-datepicker-div > table > tbody > tr:nth-child(3) > td.ui-datepicker-current-day"
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

    // Click on <button> "Book teetime at 18:00"
    // THIS RESERVES THE TEE BOOKING
    const bookTeetime = "#cluetip-inner form > .btn"
    await pageVariable.waitForSelector(bookTeetime)
    await Promise.all([
      pageVariable.click(bookTeetime),
      pageVariable.waitForNavigation(),
    ])

    // -----------------------
    // Now click Add Buggy Booking Service link on the Booking Details page
    // -----------------------
    const addBuggy =
      "#teebooking_info > table > tbody > tr:nth-child(7) > td > a"
    await pageVariable.waitForSelector(addBuggy)
    await pageVariable.click(addBuggy)
    await pageVariable.click(addBuggy)

    // -----------------------
    // Now Enter Second Player
    // -----------------------

    // Click on <a> "Enter Details"
    await pageVariable.waitForSelector('tr:nth-child(2) [href="#"]')
    await pageVariable.click('tr:nth-child(2) [href="#"]')

    // Click on <a> "ANOTHER MEMBER"
    await pageVariable.waitForSelector(
      '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
    )
    await pageVariable.click(
      '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
    )

    // Fill "LAI" on <input> .content [name="partner"]
    await pageVariable.waitForSelector(
      '.content [name="partner"]:not([disabled])'
    )
    await pageVariable.type('.content [name="partner"]', "LAI")

    // Click on <input> .content [name="submit"]
    await pageVariable.waitForSelector('.content [name="submit"]')
    await pageVariable.click('.content [name="submit"]')

    // Click on <a> "David Laird (40.5)"
    const partner1 = '[href="?edit=4346420&addpartner=10712&partnerslot=2"]'
    await pageVariable.waitForSelector(partner1, { visible: true })

    await Promise.all([
      pageVariable.click(partner1),
      pageVariable.waitForNavigation(),
    ])

    // // Now enter Name of 3rd Person
    // const addPartner3 =
    //   "#teebooking_players > table > tbody > tr:nth-child(3) > td:nth-child(2) > i > a"
    // await pageVariable.waitForSelector(addPartner3)
    // await pageVariable.click(addPartner3)

    // // Select Rodney Ross
    // const selectPartner3 =
    //   "#facebox > div > table > tbody > tr:nth-child(2) > td.body > div > div.content > p:nth-child(1) > a:nth-child(2)"
    // await pageVariable.waitForSelector(selectPartner3)
    // await pageVariable.click(selectPartner3)
  },
}

// ------------------------------------------------------------------

const addTwoWeeks = (daysFromToday) => {
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

export class breakdownBookingTimes {
  constructor(requestedBooking) {
    this.fullDate = requestedBooking

    // Extract Minutes of Tee Booking and convert to String
    const m = requestedBooking.getMinutes()
    this.minutesOfTeeBooking = ("0" + m).slice(-2)

    // Extract Hours of Tee Booking and convert to String
    const h = requestedBooking.getHours()
    this.hoursOfTeeBooking = ("0" + h).slice(-2)

    // Extract Days of Tee Booking and convert to String
    const d = requestedBooking.getDate()
    this.daysOfTeeBooking = ("0" + d).slice(-2)

    // Extract Months of Tee Booking and convert to String
    const mo = requestedBooking.getMonth() + 1
    this.monthsOfTeeBooking = ("0" + mo).slice(-2)

    // Extract Years of Tee Booking and convert to String
    this.yearsOfTeeBooking = requestedBooking.getFullYear().toString().slice(-2)
  }
}
