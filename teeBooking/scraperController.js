import { pagePreparationObject } from "./pagePreparation.js"

export const scraperController = async (browser) => {
  // Load Home Web Page
  let page = await pagePreparationObject.loadHomeWebPage(browser)

  // Login to Tee Booking section of the Golf Club Web Site
  page = await pagePreparationObject.loginToTeeBookingSubsystem(page)

  const requestedBooking = new Date("2024-12-13T18:00:00.000Z")
  const numberOfPlayingPartners = 0
  const numberOfBuggiesRequested = 1

  if (numberOfPlayingPartners > 1) {
    const numberOfBuggiesRequested = 2
  }

  // const daysFromToday = 14
  // const twoWeeks = 1000 * 60 * 60 * 24 * daysFromToday
  // const requestedBooking = new Date(new Date().getTime() + twoWeeks)
  // console.log("Two Weeks Time: " + requestedBooking.toISOString())

  // --------------------
  // SHOULD BE 00 MINUTES OR EITHER EVERY 10 MINUTES OR EVERY 8 MINUTES IN SUMMER
  // --------------------

  const bookingDateTime = new breakdownBookingTimes(requestedBooking)

  // Navigate to Tee Booking Page daysFromToday Days Ahead
  await pagePreparationObject.loadTodaysTeeBookingPage(page, bookingDateTime)

  // Scroll to Tee Slot that we want to target for booking
  await pagePreparationObject.scrollToTeeBookingDateTime(
    page,
    numberOfPlayingPartners,
    numberOfBuggiesRequested,
    bookingDateTime
  )
}

// ------------------------------------------------------------------

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
