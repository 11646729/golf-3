import puppeteer from "puppeteer"
import { prepareToRunAtASpecificTime } from "./prepareTimeForBooking.js"

// ------------------------------------------------------------------
;(async () => {
  const t0 = performance.now()

  console.log(new Date())

  try {
    // Start the browser and create a browser instance
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    })

    // Requested Tee Booking Parameters
    let teeBookingTime = new Date("2025-04-07T18:00:00.000Z")

    let noOfPlayers = 1 // Minimum of 1 but normally would be 3
    let noOfHoles = 9 // Either 9, 13 or 18 Holes but normally would be 9
    let noOfBuggies = 1 // Minimum of 1 but normally would be 2

    // Validate Requested Tee Booking Parameters
    let validBooking = validateBookingParameters(
      noOfPlayers,
      noOfHoles,
      noOfBuggies
    )

    if (validBooking) {
      // Call a routine to split the booking object
      prepareToRunAtASpecificTime(
        browser,
        teeBookingTime,
        noOfPlayers,
        noOfHoles,
        noOfBuggies
      )
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
