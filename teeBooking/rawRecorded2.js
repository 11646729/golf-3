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

  // Click on <label> "2"
  await page.waitForSelector(
    "#cluetip-inner .form-group:nth-child(1) .btn:nth-child(2)"
  )
  await page.click("#cluetip-inner .form-group:nth-child(1) .btn:nth-child(2)")

  // Click on <label> "3"
  await page.waitForSelector("#cluetip-inner .btn:nth-child(3)")
  await page.click("#cluetip-inner .btn:nth-child(3)")

  // Click on <label> "4"
  await page.waitForSelector("#cluetip-inner .btn:nth-child(4)")
  await page.click("#cluetip-inner .btn:nth-child(4)")

  // Scroll wheel by X:0, Y:12
  await page.evaluate(() => window.scrollBy(0, 12))

  // Click on <label> "9 holes"
  await page.waitForSelector(
    "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)"
  )
  await page.click("#cluetip-inner .form-group:nth-child(7) .btn:nth-child(1)")

  // Click on <label> "18 holes"
  await page.waitForSelector(
    "#cluetip-inner .form-group:nth-child(7) .btn:nth-child(2)"
  )
  await page.click("#cluetip-inner .form-group:nth-child(7) .btn:nth-child(2)")

  await browser.close()
})()
