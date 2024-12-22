import { pagePreparationObject } from "./pagePreparation.js"

// ---------------------------------------------------------------------

export const scraperController = async (
  browser,
  bookingDateTime,
  numberOfPlayers,
  numberOfHoles,
  numberOfBuggies
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
  // THIS LOOPS UNTIL BUTTON EXISTS - ??????????????//
  await pagePreparationObject.pressTeeBookingButton(page, bookingDateTime)

  // ---------------------------------------------------------------------

  // Enter Tee Booking Partner Numbers & Number Of Holes to Play then Press Button to Reserve Tee Booking
  page =
    await pagePreparationObject.enterTeeBookingNumberOfPlayersNumberOfHoles(
      page,
      numberOfPlayers,
      numberOfHoles
    )

  // // Enter Tee Booking Number of Buggies & Partner Names, Save the Tee Booking & Finish
  await pagePreparationObject.enterTeeBookingNumberOfBuggiesPartnersNamesPressFinish(
    page,
    numberOfBuggies,
    numberOfPlayers,
    bookingDateTime
  )

  // Log out of the Web Site
  await pagePreparationObject.logoutOfGolfClubWebSite(page)
}

// ------------------------------------------------------------------
