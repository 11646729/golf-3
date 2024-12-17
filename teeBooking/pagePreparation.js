import "dotenv/config.js"

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

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
      await page.click('.btn[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In To Tee Booking Subsystem ...`),
    ])

    return page
  },

  // ------------------------------------------------------------------

  async clickBookTeeTimePage(page) {
    // Click on <a> "Book a tee time"
    await page.waitForSelector(
      'td > [href="' + process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM + '"]',
      { visible: true }
    )
    await Promise.all([
      page.click(
        'td > [href="' + process.env.GOLF_CLUB_TEE_BOOKING_SUBSYSTEM + '"]'
      ),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Click To Book Tee Time ...`),
    ])

    return page
  },

  // ------------------------------------------------------------------

  async loadTodaysTeeBookingPage(page, bookingDateTime) {
    // Click on <input> #date
    await page.waitForSelector("#date")
    await page.click("#date")

    const teeBookingDay =
      "tr:nth-child(" +
      bookingDateTime.calendarControlRowNo +
      ") > td:nth-child(" +
      bookingDateTime.calendarControlColumnNo +
      ") > [href='#']"
    console.log(teeBookingDay)
    await page.waitForSelector(teeBookingDay)
    await page.click(teeBookingDay)

    await sleep(2000)
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

    await waitForSelectorWithReload(page, bookTeeSlot)
    // await page.waitForSelector(bookTeeSlot)

    const afterBooking = new Date()
    let textAfter = afterBooking.toISOString()
    console.log("Time after booking: " + textAfter)

    await page.click(bookTeeSlot)
  },

  // ------------------------------------------------------------------

  async enterTeeBookingNumberOfPartnersNumberOfHoles(
    page,
    numberOfPlayingPartners,
    numberOfHoles
  ) {
    // -------------------------
    // Select Number of Partners
    // -------------------------

    // Click on <label> "2"
    if (numberOfPlayingPartners == 1) {
      const numberOfPlayers =
        "#cluetip-inner .form-group:nth-child(1) .btn:nth-child(2)"
      await page.waitForSelector(numberOfPlayers)
      await page.click(numberOfPlayers)
    }

    // Click on <label> "3"
    if (numberOfPlayingPartners == 2) {
      const numberOfPlayers =
        "#cluetip-inner .form-group:nth-child(1) .btn:nth-child(3)"
      await page.waitForSelector(numberOfPlayers)
      await page.click(numberOfPlayers)
    }

    // Click on <label> "4"
    if (numberOfPlayingPartners == 3) {
      const numberOfPlayers =
        "#cluetip-inner .form-group:nth-child(1) .btn:nth-child(4)"
      await page.waitForSelector(numberOfPlayers)
      await page.click(numberOfPlayers)
    }

    // Click on <label> "9 holes"
    // Change label:nth-child(1) to label:nth-child(2) in line below for 18 Holes
    if (numberOfHoles == 9) {
      const numHoles =
        "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)"
      await page.waitForSelector(numHoles)
      await page.click(numHoles)
    }

    //  Now click Booking Button to bring up the Booking Details page
    // THIS RESERVES THE TEE BOOKING
    const bookTeetimeButton = "#cluetip-inner form > .btn"
    await page.waitForSelector(bookTeetimeButton)
    await Promise.all([page.click(bookTeetimeButton), page.waitForNavigation()])

    return page
  },

  async enterTeeBookingPartnersNames(
    page,
    numberOfPlayingPartners,
    numberOfBuggiesRequested
  ) {
    // -----------------------
    // Now Enter Second Player
    // -----------------------

    if (numberOfPlayingPartners == 1) {
      // Click on <a> "Enter Details"
      await page.waitForSelector('tr:nth-child(2) [href="#"]')
      await page.click('tr:nth-child(2) [href="#"]')

      // Click on <a> "ANOTHER MEMBER"
      await page.waitForSelector(
        '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
      )
      await page.click(
        '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
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
      const partner1 = '[href="?edit=4346420&addpartner=10712&partnerslot=2"]'
      await page.waitForSelector(partner1, { visible: true })
      await Promise.all([page.click(partner1), page.waitForNavigation()])
    }

    // -----------------------
    // Now Enter Third Player
    // -----------------------

    if (numberOfPlayingPartners == 2) {
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
    }

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
  },

  // --------------------------
  // Now finish the Tee Booking
  // --------------------------

  async pressFinishTeeBooking(page) {
    // Click on <a> " Finish"
    await page.waitForSelector('[href="?edit=4346420&redirectToHome=1"]')
    await Promise.all([
      page.click('[href="?edit=4346420&redirectToHome=1"]'),
      page.waitForNavigation(),
    ])
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
      const element = await page.waitForSelector(selector, {
        timeout: 1000,
      })

      console.log("Attempt No: " + tries)

      return element
    } catch (error) {
      if (tries === MAX_TRIES) throw error

      tries += 1
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
      await page.waitForNavigation({ waitUntil: "networkidle0" })

      console.log("Attempt error")
    }
  }
}
