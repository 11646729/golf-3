const puppeteer = require("puppeteer")
;(async () => {
  const browser = await puppeteer.launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  })
  const page = await browser.newPage()

  // Load "https://www.cgc-ni.com/memberbooking/?edit=4623168&newbooking=1"
  await page.goto(
    "https://www.cgc-ni.com/memberbooking/?edit=4623168&newbooking=1"
  )

  // Resize window to 1728 x 835
  await page.setViewport({ width: 1728, height: 835 })

  // Click on <a> "Buggy Booking (£0.00)"
  await page.waitForSelector('[href="?edit=4623168&addservice=19"]')
  await Promise.all([
    page.click('[href="?edit=4623168&addservice=19"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> "Buggy Booking (£0.00)"
  await page.waitForSelector('[href="?edit=4623168&addservice=19"]')
  await Promise.all([
    page.click('[href="?edit=4623168&addservice=19"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> " Cancel booking"
  await page.waitForSelector('[href="?edit=4623168&cancel=1"]')
  await Promise.all([
    page.click('[href="?edit=4623168&cancel=1"]'),
    page.waitForNavigation(),
  ])

  // Click on <input> p > input:nth-child(2)
  await page.waitForSelector("p > input:nth-child(2)")
  await Promise.all([
    page.click("p > input:nth-child(2)"),
    page.waitForNavigation(),
  ])

  await browser.close()
})()
