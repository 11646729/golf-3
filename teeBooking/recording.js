const puppeteer = require("puppeteer")
;(async () => {
  const browser = await puppeteer.launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  })
  const page = await browser.newPage()

  // Load "https://www.cgc-ni.com/"
  await page.goto("https://www.cgc-ni.com/")

  // Resize window to 1138 x 835
  await page.setViewport({ width: 1138, height: 835 })

  // Scroll wheel by X:0, Y:182
  await page.evaluate(() => window.scrollBy(0, 182))

  // Click on <a> "Book a tee time"
  await page.waitForSelector('td > [href="/memberbooking/"]')
  await Promise.all([
    page.click('td > [href="/memberbooking/"]'),
    page.waitForNavigation(),
  ])

  await browser.close()
})()
