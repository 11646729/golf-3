const puppeteer = require("puppeteer")

;(async () => {
  const targetTime = new Date()
  targetTime.setHours(19, 0, 0, 0) // Set to 7:00 PM

  const currentTime = new Date()
  const waitTime = targetTime - currentTime

  if (waitTime > 0) {
    console.log(`Waiting ${waitTime / 1000} seconds until 7:00 PM...`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto("https://example.com") // Replace with your URL

  console.log("Refreshing page at 7:00 PM...")
  await page.reload()

  console.log("Waiting 1 second to extract selector...")
  await page.waitForTimeout(1000) // Wait 1 second

  const selectorValue = await page.$eval(
    "YOUR_SELECTOR",
    (el) => el.textContent
  ) // Replace YOUR_SELECTOR
  console.log(`Selector value: ${selectorValue}`)

  await browser.close()
})()
