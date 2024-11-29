import startBrowser from "./browser.js"
import scraperController from "./scraperController.js"

// Start the browser and create a browser instance
let browserInstance = startBrowser()

// -----------------------------------------
// RELOAD PAGE BASED ON A SPECIFIC TIME HERE
// -----------------------------------------
// and this is how you log out the current date at 6:01 every day:
// runAtSpecificTimeOfDay(6, 1, () => {
//   console.log(new Date())
// })

// Pass the browser instance to the scraper controller
scraperController(browserInstance)

// some scenarios require us to run a piece of code at a specific time of day, the following method allows us to do this:
const runAtSpecificTimeOfDay = (hour, minutes, func) => {
  const twentyFourHours = 86400000
  const now = new Date()
  let eta_ms =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minutes,
      0,
      0
    ).getTime() - now

  if (eta_ms < 0) {
    eta_ms += twentyFourHours
  }

  setTimeout(function () {
    //run once
    func()
    // run every 24 hours from now on
    setInterval(func, twentyFourHours)
  }, eta_ms)
}
