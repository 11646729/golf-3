import * as cheerio from "cheerio"
import { getAndSavePortArrivals } from "./controllers/portArrivalsController.js"
import {
  saveVesselDetails,
  scrapeVesselDetails,
} from "./controllers/vesselController.js"

// -------------------------------------------------------
// Import Port Arrivals & Vessel Details
// -------------------------------------------------------
export const importPortArrivalsAndVessels = async (req, res) => {
  // Get the Port Name & Associated values
  //  let port = req.query.portName.toUpperCase()

  const port = process.env.BELFAST_PORT_NAME.toUpperCase()
  // const port = process.env.GEIRANGER_PORT_NAME.toUpperCase()
  // const port = process.env.BERGEN_PORT_NAME.toUpperCase()
  const portUrl = port + "_PORT_URL"
  const portName = process.env[portUrl]

  // Thirdly get the available Months & Years for chosen Port
  const scheduledPeriods = await getScheduleMonths(portName)

  if (scheduledPeriods.length === 0) {
    console.log("CruiseMapper currently has no ship schedule for Selected Port")
  } else {
    // Fourthly get all the Vessel Arrivals per Month
    let vesselUrls = await getAndSavePortArrivals(
      scheduledPeriods,
      port,
      portName
    )

    // Now remove duplicates and store Urls in DeduplicatedVesselUrlArray array
    const DeduplicatedVesselUrlArray = Array.from(new Set(vesselUrls))

    // Sort array ascending
    DeduplicatedVesselUrlArray.sort()

    let loop = 0
    do {
      // Extract urls for vessels & store in newVessel array
      let scrapedVessel = await scrapeVesselDetails(
        DeduplicatedVesselUrlArray[loop]
      )

      saveVesselDetails(scrapedVessel)

      loop++
    } while (loop < DeduplicatedVesselUrlArray.length)

    // scrapeBelfastHarbourCruiseShips("tbody") //  ".post"
    scrapeBelfastHarbourCruiseShips()
    // getGenre()

    // Length of vesselUrls array is the Number of Vessel Arrivals
    console.log(vesselUrls.length + " Port Arrivals added")
    console.log(DeduplicatedVesselUrlArray.length + " Vessels added")
  }
}

// -------------------------------------------------------
// Fetch Year & Months which show Vessel Arrival Data
// Path: Local function called by importPortArrivalsAndVessels
// -------------------------------------------------------
const getScheduleMonths = async (portName) => {
  let scheduledPeriods = []

  let initialPeriod = new Date().toISOString().slice(0, 7)

  let initialUrl =
    process.env.CRUISE_MAPPER_URL +
    portName +
    "?tab=schedule&month=" +
    initialPeriod +
    "#schedule"

  // Fetch the initial html page
  const response = await fetch(initialUrl)
  const data = await response.text()

  // Load cheerio
  const $ = cheerio.load(data)

  $("#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option").each(
    (i, item) => {
      const monthYearString = $(item).attr("value")

      scheduledPeriods.push({
        monthYearString,
      })
    }
  )

  return scheduledPeriods
}

// -------------------------------------------------------
// -------------------------------------------------------
const scrapeBelfastHarbourCruiseShips = async (selector) => {
  // Assume the source html is something like this:
  const html2 = `
  <html>
    <head />
    <body>
      <article class="post">
        <h1>Title</h1>
        <p>First paragraph.</p>
        <script>That for some reason has been put here</script>
        <p>Second paragraph.</p>
        <ins>Google ADS</ins>
        <p>Third paragraph.</p>
        <div class="related">A block full of HTML and text</div>
        <p>Forth paragraph.</p>
      </article>
    </body>
  </html>
  `

  // Where:
  // $ is the cheerio object containing const $ = await cheerio.load(html);
  // selector is the dome selector for the container (in the example above it would be .post)

  let stripFromText = [
    // "body",
    // "head",
    // "script",
    // "meta",
    // "style",
    // "link",
    // "section",
    // "!--",
    // ".wt-cli-cookie-description",
    // ".adv-in",
    // ".postinfo",
    // ".postauthor",
    // ".widget",
    // ".related",
    // "img",
    // "p:empty",
    // "div:empty",
    // "section:empty",
    // "ins",
  ]

  const getHTMLContent = async (selector) => {
    const initialUrl = "https://www.belfast-harbour.co.uk/port/cruise-schedule/"

    const vessels_data = []

    try {
      // Fetch the initial html page
      const response = await fetch(initialUrl)
      const data = await response.text()

      // Load cheerio
      const $ = cheerio.load(data)

      const table = $(
        "body > main > div.page-content > div.elementor.elementor-2472 > section.elementor-section.elementor-top-section.elementor-element.elementor-element-7999ad4.elementor-section-boxed.elementor-section-height-default > div > div > div > div.elementor-element.elementor-element-1397594.elementor-widget.elementor-widget-shortcode > div.elementor-widget-container > div.elementor-shortcode > table"
      ).html()

      console.log(table)

      // -------------------------------------------------------
      // This produces:
      //   <thead>
      //     <tr>
      //         <th></th>
      //         <th>ARRIVAL<br>DATE &amp; TIME</th>
      //         <th></th>
      //         <th>DEPARTURE<br>DATE &amp; TIME</th>
      //         <th>COMPANY</th>
      //         <th>SHIP NAME</th>
      //         <th></th>
      //     </tr>
      // </thead>
      // <tbody id="load_data">
      // </tbody>
      // -------------------------------------------------------
      // Selecting thead works as expected but selecting tbody does not work
      // -------------------------------------------------------

      // #load_data > tr:nth-child(1) > td.day-call

      // $(
      //   "body > main > div.page-content > div.elementor.elementor-2472 > section.elementor-section.elementor-top-section.elementor-element.elementor-element-7999ad4.elementor-section-boxed.elementor-section-height-default > div > div > div > div.elementor-element.elementor-element-1397594.elementor-widget.elementor-widget-shortcode > div.elementor-widget-container > div.elementor-shortcode > table#shortcodeTable > tbody#load_data"
      // )
      //   .find("tr#desktopTr")
      //   .each((index, element) => {
      //     console.log($(element).find("td.day-call")).text()
      //     // scraping logic...
      //   })

      // $(table).each(function () {
      //   let vesselName = $(this).find("tr#desktopTr > td.day-call").text()

      //   console.log(vesselName)
      //   // vessels_data.push({ vesselName })
      // })

      // console.log(vessels_data)
    } catch (error) {
      console.error(error)
    }
  }

  //     // Fetch the initial data
  //     const { data: html } = await axios.get(initialUrl)

  //     const $ = cheerio.load(html)

  //     // Select the table element
  //     let table = $("body")
  //     console.log(table.html())

  //     let value
  //     try {
  //       let content = $(selector)

  //       for (const s of stripFromText) {
  //         console.log(`--- Stripping ${s}`)
  //         content.find(s).remove()
  //       }

  //       // Now remove blank lines left in the content html file
  //       value = trim_and_remove_blank_lines(content.html())
  //     } catch (e) {
  //       console.log(`- [!] Unable to get ${selector}`)
  //     }
  //     console.log(value)
  //     // return value
  //   }

  //   const trim_and_remove_blank_lines = (string) => {
  //     return string.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "")
  //   }

  getHTMLContent(selector)
}

// -------------------------------------------------------
// Test scraping function taken from YouTube
// -------------------------------------------------------
const getGenre = async () => {
  const booksUrl =
    "https://books.toscrape.com/catalogue/category/books/historical-fiction_4/index.html"

  try {
    // Fetch the initial html page
    const response = await fetch(booksUrl)
    const data = await response.text()

    // Load cheerio
    const $ = cheerio.load(data)

    const genre = $("h1").text()
    console.log(genre)
  } catch (error) {
    console.error(error)
  }
}
