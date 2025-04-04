import "dotenv/config.js"

// const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

export const pagePreparationObject = {
  // ------------------------------------------------------------------

  async loadHomePage(browser) {
    // Load Browser Instance
    let page = await browser.newPage()

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15"
    )

    // Navigate to Initial Web page & wait for it to load
    await page.goto(process.env.GOLF_CLUB_HOME_URL, { waitUntil: "load" })

    console.log(`Opened Home Page: ${process.env.GOLF_CLUB_HOME_URL}`)

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
      page.click('.btn[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In To Tee Booking Subsystem ...`),
    ])

    return page
  },

  // ------------------------------------------------------------------

  async clickBookTeeTimePage(page) {
    // Click on <a> "Book a tee time"
    await page.waitForSelector('td > [href="/memberbooking/"]')
    await Promise.all([
      page.click('td > [href="/memberbooking/"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ])

    return page
  },

  // ------------------------------------------------------------------

  async loadTodaysTeeBookingPage(page, calendarControlParameters) {
    // Click on <input> #date
    await page.waitForSelector("#date")
    await page.click("#date")

    // Click on <select> "2024 2025 2026 2027 2028"
    await page.waitForSelector(".ui-datepicker-year")
    await page.click(".ui-datepicker-year")

    // Fill calendarControlYear on <select> .ui-datepicker-year
    await page.waitForSelector(".ui-datepicker-year")
    await page.select(
      ".ui-datepicker-year",
      calendarControlParameters.calendarControlYear
    )

    // Click on <select> "Jan Feb Mar Apr May Jun J..."
    await page.waitForSelector(".ui-datepicker-month")
    await page.click(".ui-datepicker-month")

    // Fill calendarControlMonth on <select> .ui-datepicker-month
    // January == 0, February == 1 etc.
    await page.waitForSelector(".ui-datepicker-month")
    await page.select(
      ".ui-datepicker-month",
      calendarControlParameters.calendarControlMonth
    )

    // Click on Row & Column of Drop-down Calendar
    const teeBookingDay =
      "tr:nth-child(" +
      calendarControlParameters.calendarControlRowNo +
      ") > td:nth-child(" +
      calendarControlParameters.calendarControlColumnNo +
      ") > [href='#']"

    await page.waitForSelector(teeBookingDay)
    await page.click(teeBookingDay)
  },

  // ------------------------------------------------------------------

  async pressTeeBookingButton(page, bookingDateTime) {
    // Click on <a> "Book"
    const bookTeeSlot =
      '[href="?date=' +
      bookingDateTime.daysOfTeeBooking +
      "-" +
      bookingDateTime.monthsOfTeeBooking +
      "-" +
      bookingDateTime.yearsOfTeeBooking +
      "&course=1&group=1&book=" +
      bookingDateTime.hoursOfTeeBooking +
      ":" +
      bookingDateTime.minutesOfTeeBooking +
      ":" +
      bookingDateTime.secondsOfTeeBooking +
      '"]'

    const beforeBooking = new Date()
    let textBefore = beforeBooking.toISOString()
    console.log("Time before booking: " + textBefore)

    // await waitForSelectorWithReload(page, bookTeeSlot)
    await page.waitForSelector(bookTeeSlot)

    const afterBooking = new Date()
    let textAfter = afterBooking.toISOString()
    console.log("Time after booking: " + textAfter)

    await page.click(bookTeeSlot)
  },

  // ------------------------------------------------------------------

  async enterTeeBookingNumberOfPlayersNumberOfHoles(
    page,
    extendedBookingDetails
  ) {
    // -------------------------
    // Select Number of Players
    // -------------------------
    const tempNumberOfPlayers =
      "#cluetip-inner .form-group:nth-child(1) .btn:nth-child(" +
      extendedBookingDetails.numberOfPlayers +
      ")"
    await page.waitForSelector(tempNumberOfPlayers)
    await page.click(tempNumberOfPlayers)

    // -------------------------
    // Select Number of Holes
    // -------------------------
    // Create holes variable
    let holes = 0

    // Change holes variable for 9 or 18 holes or report error
    if (extendedBookingDetails.numberOfHoles == 9) {
      holes = 1
    } else if (extendedBookingDetails.numberOfHoles == 18) {
      holes = 2
    } else {
      console.log("Error in Number of holes chosen - must be 9 or 18 only")
    }

    const numHoles =
      "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(" + holes + ")"
    await page.waitForSelector(numHoles)
    await page.click(numHoles)

    // -------------------------------------------------------------
    // Now click Booking Button to bring up the Booking Details page
    // THIS RESERVES THE TEE BOOKING
    // -------------------------------------------------------------
    const bookTeetimeButton = "#cluetip-inner form > .btn"
    await page.waitForSelector(bookTeetimeButton)
    await Promise.all([page.click(bookTeetimeButton), page.waitForNavigation()])

    return page
  },

  // ------------------------------------------------------------------

  async enterTeeBookingNumberOfBuggiesPartnersNames(
    page,
    extendedBookingDetails
    // splitBookingDateTime
  ) {
    // -------------------
    // Now reserve buggies
    // -------------------
    // Getting the href of a link with the class 'external-link'
    const link = await page.$(
      "#teebooking_info > table > tbody > tr:nth-child(7) > td > a"
    )
    const href = await link.getProperty("href")
    const text = await href.jsonValue()
    let bookingNumber = text.slice(text.indexOf("=") + 1, text.indexOf("&"))

    // Click on <a> "Buggy Booking (£0.00)"
    const buggyBookingString =
      '[href="?edit=' + bookingNumber + '&addservice=19"]'
    for (let step = 1; step <= extendedBookingDetails.numberOfBuggies; step++) {
      await page.waitForSelector(buggyBookingString)
      await Promise.all([
        page.click(buggyBookingString),
        page.waitForNavigation(),
      ])
    }

    // -----------------------
    // Now Enter Second Player
    // -----------------------
    if (extendedBookingDetails.numberOfPlayers == 2) {
      // Click on <a> "Enter Details"
      await page.waitForSelector('tr:nth-child(2) [href="#"]')
      await page.click('tr:nth-child(2) [href="#"]')

      // Click on <a> "ANOTHER MEMBER"
      await page.waitForSelector(
        '[href="?edit=' + bookingNumber + '&memdiv=1#memberdiv&partnerslot=2"]'
      )
      await page.click(
        '[href="?edit=' + bookingNumber + '&memdiv=1#memberdiv&partnerslot=2"]'
      )

      // Fill "LAI" on <input> .content [name="partner"]
      await page.waitForSelector('.content [name="partner"]:not([disabled])')
      await page.type(
        '.content [name="partner"]',
        process.env.DAVID_LAIRD_INITIALS
      )

      // Click on <input> .content [name="submit"]
      await page.waitForSelector('.content [name="submit"]')
      await page.click('.content [name="submit"]')

      // Click on <a> "David Laird (40.5)"
      const partner1 =
        '[href="?edit=' + bookingNumber + '&addpartner=10712&partnerslot=2"]'
      await page.waitForSelector(partner1, { visible: true })
      await Promise.all([page.click(partner1), page.waitForNavigation()])
    }

    // -----------------------
    // Now Enter Third Player
    // -----------------------
    if (extendedBookingDetails.numberOfPlayers == 3) {
      // Click on <a> "Enter Details"
      await page.waitForSelector('[href="#"]')
      await page.click('[href="#"]')

      // Click on <a> "Rodney Ross"
      await page.waitForSelector(
        '[href="?edit=' + bookingNumber + '&addpartner=11206&partnerslot=3"]'
      )
      await Promise.all([
        page.click(
          '[href="?edit=' + bookingNumber + '&addpartner=11206&partnerslot=3"]'
        ),
        page.waitForNavigation(),
      ])
    }

    return bookingNumber
  },

  async pressFinishAndReport(
    page,
    extendedBookingDetails,
    splitBookingDateTime,
    bookingNumber
  ) {
    // --------------------------
    // Now finish the Tee Booking
    // --------------------------
    const finishBookingString =
      '[href="?edit=' + bookingNumber + '&redirectToHome=1"]'
    await page.waitForSelector(finishBookingString)
    await Promise.all([
      page.click(finishBookingString),
      page.waitForNavigation(),
    ])

    // ----------------------
    // Report of Booking Made
    // ----------------------
    console.log("Booking No: " + bookingNumber + " made")

    console.log("For " + splitBookingDateTime.fullDateTime.toISOString())

    if (extendedBookingDetails.numberOfPlayers == 1) {
      console.log("For: " + extendedBookingDetails.numberOfPlayers + " Player")
    } else {
      console.log("For: " + extendedBookingDetails.numberOfPlayers + " Players")
    }
    if (extendedBookingDetails.numberOfBuggies == 1) {
      console.log("With: " + extendedBookingDetails.numberOfBuggies + " Buggy")
    } else {
      console.log(
        "With: " + extendedBookingDetails.numberOfBuggies + " Buggies"
      )
    }
  },

  // ---------------------------
  // Now log out of the Web Site
  // ---------------------------
  async logoutOfGolfClubWebSite(page) {
    // Click on <a> "Logout"
    const logoutlink = "#logoutbtn"
    await page.waitForSelector(logoutlink)
    await Promise.all([page.click(logoutlink), page.waitForNavigation()])
  },
}

// ------------------------------------------------------------------

// -----------------------------------------
// Now wait for button on new page to appear
// -----------------------------------------

const waitForSelectorWithReload = async (page, selector) => {
  const MAX_TRIES = 5
  let tries = 0
  while (tries <= MAX_TRIES) {
    try {
      // console.log("Here")
      console.log(tries)
      console.log(MAX_TRIES)

      const element = await page.waitForSelector(selector, {
        timeout: 1000, // 1000 milliseconds = 1 second
      })

      console.log("Attempt No: " + tries)

      return element
    } catch (error) {
      console.log(error)

      if (tries === MAX_TRIES) throw error

      tries += 1
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
      await page.waitForNavigation({ waitUntil: "networkidle0" })

      console.log("Attempt error")
    }
  }
}
