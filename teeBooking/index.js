import puppeteer from "puppeteer"
import { prepareTimeForBooking } from "./prepareTimeForBooking.js"

// ------------------------------------------------------------------
;(async () => {
  const t0 = performance.now()
  try {
    // Start the browser and create a browser instance
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    })

    // Requested Tee Booking Parameters
    let requestedBookingTime = new Date("2025-02-06T16:00:00.000Z")

    let numberOfPlayers = 1 // Minimum of 1 but normally would be 3
    let numberOfHoles = 9 // Either 9, 13 or 18 Holes but normally would be 9
    let numberOfBuggies = 1 // Minimum of 1 but normally would be 2

    // Validate Requested Tee Booking Parameters
    let validBooking = validateBookingParameters(
      numberOfPlayers,
      numberOfHoles,
      numberOfBuggies
    )

    if (validBooking) {
      // Convert Tee Booking details into a booking Object
      const booking = new bookingObject(
        requestedBookingTime,
        numberOfPlayers,
        numberOfHoles,
        numberOfBuggies
      )

      // Call a routine to split the booking object
      prepareTimeForBooking(browser, booking)
    } else {
      console.log("Invalid parameters entered for Tee Booking")
    }

    const t1 = performance.now()
    console.log(`Call to Start Program ${t1 - t0} milliseconds.`)
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err)
  }
})()

// ------------------------------------------------------------------
// Validate Booking Request Parameters
// ------------------------------------------------------------------
const validateBookingParameters = (
  numberOfPlayers,
  numberOfHoles,
  numberOfBuggies
) => {
  let validTest = true

  if (numberOfPlayers > 2) {
    numberOfBuggies = 2
  }

  if (numberOfPlayers < 1 || numberOfPlayers > 4) {
    validTest = false
    console.log("Number of Players is not between 1 & 4")
  }

  if (numberOfHoles != 9 && numberOfHoles != 18) {
    validTest = false
    console.log("Number of Holes is not either 9 or 18")
  }

  if (numberOfBuggies < 1 || numberOfBuggies > 2) {
    validTest = false
    console.log("Number of Buggies is not 1 or 2")
  }

  return validTest
}

// ------------------------------------------------------------------
// Convert Booking Details into a Booking Object
// ------------------------------------------------------------------

export class bookingObject {
  constructor(
    requestedBookingTime,
    numberOfPlayers,
    numberOfHoles,
    numberOfBuggies
  ) {
    this.bookingTime = requestedBookingTime
    this.noOfPlayers = numberOfPlayers
    this.noOfHoles = numberOfHoles
    this.noOfBuggies = numberOfBuggies
  }
}

// ------------------------------------------------------------------
