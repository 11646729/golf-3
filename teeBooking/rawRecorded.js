const puppeteer = require("puppeteer")
;(async () => {
  const browser = await puppeteer.launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  })
  const page = await browser.newPage()

  // Load "https://www.cgc-ni.com/memberbooking/"
  await page.goto("https://www.cgc-ni.com/memberbooking/")

  // Resize window to 1728 x 835
  await page.setViewport({ width: 1728, height: 835 })

  // Click on <a> "Book"
  await page.waitForSelector(
    '[href="?date=13-12-2024&course=1&group=1&book=18:00:00"]'
  )
  await page.click('[href="?date=13-12-2024&course=1&group=1&book=18:00:00"]')

  // Click on <label> "9 holes"
  await page.waitForSelector(
    "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)"
  )
  await page.click("#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)")

  // Click on <button> "Book teetime at 18:00"
  await page.waitForSelector("#cluetip-inner form > .btn")
  await Promise.all([
    page.click("#cluetip-inner form > .btn"),
    page.waitForNavigation(),
  ])

  // Click on <a> "Buggy Booking (£0.00)"
  await page.waitForSelector('[href="?edit=4346420&addservice=19"]')
  await Promise.all([
    page.click('[href="?edit=4346420&addservice=19"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> " Finish"
  await page.waitForSelector('[href="?edit=4346420&redirectToHome=1"]')
  await Promise.all([
    page.click('[href="?edit=4346420&redirectToHome=1"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> "Logout"
  await page.waitForSelector("#logoutbtn")
  await Promise.all([page.click("#logoutbtn"), page.waitForNavigation()])

  await browser.close()
})()
