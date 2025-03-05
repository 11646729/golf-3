import { pagePreparationObject } from "./pagePreparation.js"

export const scraperController = async (
  browser,
  myExtendedBookingObject,
  myCalendarControlObject,
  page
) => {
  console.log(new Date())
  // console.log(page)

  // // ---------------------------------------------------------------------
  // // Press Tee Booking Button - if it exists
  // // THIS LOOPS UNTIL BUTTON EXISTS - ??????????????//
  // await pagePreparationObject.pressTeeBookingButton(
  //   page,
  //   myExtendedBookingObject
  // )
  // // ---------------------------------------------------------------------
  // // Enter Tee Booking Partner Numbers & Number Of Holes to Play then Press Button to Reserve Tee Booking
  // page =
  //   await pagePreparationObject.enterTeeBookingNumberOfPlayersNumberOfHoles(
  //     page,
  //     myExtendedBookingObject
  //   )
  // // Enter Tee Booking Number of Buggies & Partner Names
  // let bookingNumber =
  //   await pagePreparationObject.enterTeeBookingNumberOfBuggiesPartnersNames(
  //     page,
  //     myExtendedBookingObject
  //   )
  // // Press Finish to Make Booking & Display Report
  // await pagePreparationObject.pressFinishAndReport(
  //   page,
  //   myExtendedBookingObject,
  //   bookingNumber
  // )
  // // Log out of the Web Site
  // await pagePreparationObject.logoutOfGolfClubWebSite(page)
  // // Now close the browser
  // await browser.close()
}
