import { pagePreparationObject } from "./pagePreparation.js"

// ---------------------------------------------------------------------

export const scraperController = async (
  browser,
  bookingDateTime,
  numberOfPlayingPartners,
  numberOfHoles,
  numberOfBuggiesRequested
) => {
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
