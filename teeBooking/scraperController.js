import {
  pagePreparationObject,
  breakdownBookingTimes,
} from "./pagePreparation.js"

// ---------------------------------------------------------------------

export const scraperController = async (browser) => {
  // Tee Booking Parameters
  let requestedBooking = new Date("2024-12-13T18:00:00.000Z")
  let numberOfPlayingPartners = 0 // Should be 2
  let numberOfHoles = 9
  let numberOfBuggiesRequested = 1

  if (numberOfPlayingPartners >= 2) {
    numberOfBuggiesRequested = 2
  }

  // ---------------------------------------------------------------------

  // Now split requestedBooking into bookingDateTime object
  const bookingDateTime = new breakdownBookingTimes(requestedBooking)

  // Load Home Web Page
  let page = await pagePreparationObject.loadHomePage(browser)

  // Login to Tee Booking section of the Golf Club Web Site
  page = await pagePreparationObject.loginToTeeBookingSubsystem(page)

  // Click Book a Tee Time link
  page = await pagePreparationObject.clickBookTeeTimePage(page)

  // Navigate to Tee Booking Date Time Page
  await pagePreparationObject.loadTodaysTeeBookingPage(page, bookingDateTime)

  // ---------------------------------------------------------------------

  // Press Tee Booking Button - if it exists
  await pagePreparationObject.pressTeeBookingButton(page, bookingDateTime)

  // ---------------------------------------------------------------------

  // Enter Tee Booking Partner Numbers & Number Of Holes to Play
  page =
    await pagePreparationObject.enterTeeBookingNumberOfPartnersNumberOfHoles(
      page,
      numberOfPlayingPartners,
      numberOfHoles
    )

  // Enter Tee Booking Partner Names & Number of Buggies
  await pagePreparationObject.enterTeeBookingPartnersNames(
    page,
    numberOfPlayingPartners,
    numberOfBuggiesRequested
  )

  // Save the Tee Booking & Finish
  await pagePreparationObject.pressFinishTeeBooking(page)

  // Log out of the Web Site
  await pagePreparationObject.logoutOfGolfClubWebSite(page)
}

// ------------------------------------------------------------------
