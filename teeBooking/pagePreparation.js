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

  async loginToTeeBookingSubsystem(page) {
    // Enter Username & Password
    await page.waitForSelector("#memberid")
    await page.type("#memberid", process.env.MEMBERID)

    await page.waitForSelector("#pin")
    await page.type("#pin", process.env.PIN)

    // Submit the Login form and wait for process to complete
    await Promise.all([
      await page.click('.btn[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In To Tee Booking Subsystem ...`),
    ])

    // Click on <a> "Book a tee time"
    await page.waitForSelector(
      'td > [href="' + process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM + '"]',
      { visible: true }
    )
    await Promise.all([
      page.click(
        'td > [href="' + process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM + '"]'
      ),
      page.waitForNavigation(),
    ])

    return page
  },

  // ------------------------------------------------------------------

  async loadTodaysTeeBookingPage(
    page,
    daysOfTeeBooking,
    monthsOfTeeBooking,
    yearsOfTeeBooking
  ) {
    // // Create bookingDate
    // const bookingDate =
    //   daysOfTeeBooking + "-" + monthsOfTeeBooking + "-" + yearsOfTeeBooking

    // Click on <input> #date
    await page.waitForSelector("#date")
    await page.click("#date")

    // Click on <a> "13" - row 3 column 5
    // TODO - MODIFY THIS
    await page.waitForSelector('tr:nth-child(3) > td:nth-child(5) > [href="#"]')
    await page.click('tr:nth-child(3) > td:nth-child(5) > [href="#"]')
  },

  // ------------------------------------------------------------------

  async scrollToTeeBookingDateTime(
    page,
    yearsOfTeeBooking,
    monthsOfTeeBooking,
    daysOfTeeBooking,
    hoursOfTeeBooking,
    minutesOfTeeBooking,
    secondsOfTeeBooking,
    numberOfBuggiesRequested
  ) {
    // Click on <a> "Book"
    const bookTeeSlot =
      '[href="?date=' +
      daysOfTeeBooking +
      "-" +
      monthsOfTeeBooking +
      "-20" +
      yearsOfTeeBooking +
      "&course=1&group=1&book=" +
      hoursOfTeeBooking +
      ":" +
      minutesOfTeeBooking +
      ":" +
      secondsOfTeeBooking +
      '"]'
    await page.waitForSelector(bookTeeSlot)
    await page.click(bookTeeSlot)

    // Click on <label> "3"
    const numberOfPlayers = "#cluetip-inner .btn:nth-child(3)"
    await page.waitForSelector(numberOfPlayers)
    await page.click(numberOfPlayers)

    // Click on <label> "9 holes"
    // Change label:nth-child(1) to label:nth-child(2) in line below for 18 Holes
    const numberOfHoles =
      "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)"
    await page.waitForSelector(numberOfHoles)
    await page.click(numberOfHoles)

    //  Now click Booking Button to bring up the Booking Details page
    // Click on <button> "Book teetime at 18:00"
    // THIS RESERVES THE TEE BOOKING
    const bookTeetime = "#cluetip-inner form > .btn"
    await page.waitForSelector(bookTeetime)
    await Promise.all([page.click(bookTeetime), page.waitForNavigation()])

    // -----------------------
    // Now Enter Second Player
    // -----------------------

    // Click on <a> "Enter Details"
    await page.waitForSelector('tr:nth-child(2) [href="#"]')
    await page.click('tr:nth-child(2) [href="#"]')

    // Click on <a> "ANOTHER MEMBER"
    await page.waitForSelector(
      '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
    )
    await page.click('[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]')

    // Fill "LAI" on <input> .content [name="partner"]
    await page.waitForSelector('.content [name="partner"]:not([disabled])')
    await page.type('.content [name="partner"]', "LAI")

    // Click on <input> .content [name="submit"]
    await page.waitForSelector('.content [name="submit"]')
    await page.click('.content [name="submit"]')

    // Click on <a> "David Laird (40.5)"
    const partner1 = '[href="?edit=4346420&addpartner=10712&partnerslot=2"]'
    await page.waitForSelector(partner1, { visible: true })

    await Promise.all([page.click(partner1), page.waitForNavigation()])

    // -----------------------
    // Now Enter Third Player
    // -----------------------

    // Click on <a> "Enter Details"
    await page.waitForSelector('[href="#"]')
    await page.click('[href="#"]')

    // Click on <a> "Rodney Ross"
    await page.waitForSelector(
      '[href="?edit=4346420&addpartner=11206&partnerslot=3"]'
    )
    await Promise.all([
      page.click('[href="?edit=4346420&addpartner=11206&partnerslot=3"]'),
      page.waitForNavigation(),
    ])

    // -------------------
    // Now reserve buggies
    // -------------------

    // Click on <a> "Buggy Booking (£0.00)"
    const buggyBookingString = '[href="?edit=4346420&addservice=19"]'
    for (let step = 0; step < numberOfBuggiesRequested; step++) {
      await page.waitForSelector(buggyBookingString)
      await Promise.all([
        page.click(buggyBookingString),
        page.waitForNavigation(),
      ])
    }

    // Click on <a> " Finish"
    await page.waitForSelector('[href="?edit=4346420&redirectToHome=1"]')
    await Promise.all([
      page.click('[href="?edit=4346420&redirectToHome=1"]'),
      page.waitForNavigation(),
    ])

    // Click on <a> "Logout"
    await page.waitForSelector("#logoutbtn")
    await Promise.all([page.click("#logoutbtn"), page.waitForNavigation()])
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

    // Use 00 for seconds & describe as a String
    this.secondsOfTeeBooking = "00"

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
