import { pagePreparationObject } from "./pagePreparation.js"
import { pageScraperObject } from "./pageScraper.js"
import { writeFile } from "fs"
import moment from "moment"

const scraperController = async (browserInstance) => {
  // url of Web Page
  const urlString = "https://www.belfast-harbour.co.uk/port/cruise-schedule/"

  // Load initial Web page
  let browser = await browserInstance

  // Load initial Web page
  let pageVariable = await pagePreparationObject.loadInitialWebPage(
    browser,
    urlString
  )

  // Accept all cookies
  await pagePreparationObject.acceptCookies(pageVariable)

  // Load all Next Pages
  await pagePreparationObject.loadNextPages(pageVariable)

  // Scrape all the vessel details
  let scrapedArray1 = await pageScraperObject.scrapeVesselArrivalDetails1(
    pageVariable
  )

  let scrapedArray2 = await pageScraperObject.scrapeVesselArrivalDetails2(
    pageVariable
  )

  let scrapedArray3 = await pageScraperObject.scrapeVesselArrivalDetails3(
    pageVariable
  )

  let finalArray = await scraperArrayFormatter(
    scrapedArray1,
    scrapedArray2,
    scrapedArray3
  )

  // Write finalArray data to file named data.json
  writeFile("data.json", JSON.stringify(finalArray), "utf8", function (err) {
    if (err) {
      return console.log(err)
    }
    console.log(
      "The data has been scraped and saved successfully! View it at './data.json'"
    )
  })

  // Close the browser
  await browser.close()
}

// ------------------------------------------------------------------
const scraperArrayFormatter = async (
  scrapedArray1,
  scrapedArray2,
  scrapedArray3
) => {
  let finalArray = []

  for (let i = 0; i < scrapedArray1.length; i++) {
    // First reformat Arrival & Departure times
    let lengthOfStay = await scrapedArray1[i][0]

    let UTCArrivalDate = await dateFormatter(scrapedArray1[i][1])

    let UTCDepartureDate = await dateFormatter(scrapedArray1[i][3])

    // ------------------------------------------------------------------
    // Now fix end of year overnight arrival not increasing the year in the departure data
    if (lengthOfStay == "OVERNIGHT") {
      let d = new Date(UTCArrivalDate)
      let month = d.getUTCMonth() // Zero based array
      let date = d.getDate() // Zero based array

      if (month == 11 && date == 30) {
        console.log(
          "Modifying OVERNIGHT Year in departure date if vessel arrives on 31st December"
        )

        console.log("Add 1 day to UTCArrivalDate to correct UTCDepartureDate")
        d.setUTCDate(date + 1)
        UTCDepartureDate = d.toISOString()
      }
    }
    // ------------------------------------------------------------------

    let VesselLength = await textFormatter(scrapedArray2[i][0])
    let NumberOfPassengers = await textFormatter(scrapedArray2[i][1])
    let NumberOfCrew = await textFormatter(scrapedArray2[i][2])
    let HandlingAgent = await textFormatter(scrapedArray2[i][3])
    let NameOfBerth = await textFormatter(scrapedArray2[i][4])

    var cruiseShipMovement = {
      visitDuration: scrapedArray1[i][0],
      arrivalDate: UTCArrivalDate,
      departureDate: UTCDepartureDate,
      vesselCompany: scrapedArray1[i][4],
      vesselName: scrapedArray1[i][5],
      vesselLength: VesselLength,
      numberOfPassengers: NumberOfPassengers,
      numberOfCrew: NumberOfCrew,
      handlingAgent: HandlingAgent,
      numberOfBerth: NameOfBerth,
      vesselDescription: scrapedArray2[i][5],
      vesselImage: scrapedArray3[i],
    }

    finalArray.push(cruiseShipMovement)
  }

  return finalArray
}

// ------------------------------------------------------------------
const dateFormatter = async (scrapedDate) => {
  let arrivalDateTimeString = await scrapedDate

  // Remove Newline character from within the string
  arrivalDateTimeString = await arrivalDateTimeString.replace(
    /(\r\n|\n|\r|\s)/gm,
    ""
  )

  let timeResult = await arrivalDateTimeString.substring(
    arrivalDateTimeString.length - 5
  )

  let dateResult = await arrivalDateTimeString.substring(0, 2)

  let monthResult = await arrivalDateTimeString.substring(
    2,
    arrivalDateTimeString.length - 5
  )

  monthResult = moment().month(monthResult).format("MM")

  let yearResult = new Date().getFullYear()

  let UTCDate = moment
    .utc(
      moment(
        yearResult +
          "-" +
          monthResult +
          "-" +
          dateResult +
          "T" +
          timeResult +
          "Z"
      )
    )
    .format()

  return UTCDate
}

// ------------------------------------------------------------------
const textFormatter = async (scrapedText) => {
  let scrapedTextString = await scrapedText

  // Remove Newline, Space etc characters from within the string
  let reformattedText = await scrapedTextString.replace(/(\r\n|\n|\r|\s)/gm, "")
  reformattedText = await reformattedText.split(":")[1]

  return reformattedText
}

// ------------------------------------------------------------------

export default (browserInstance) => scraperController(browserInstance)
