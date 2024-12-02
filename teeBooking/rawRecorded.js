import puppeteer from "puppeteer"
;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 100, // Uncomment to visualize test
  })
  const page = await browser.newPage()

  // Load "https://www.cgc-ni.com/"
  await page.goto("https://www.cgc-ni.com/")

  // Resize window to 1728 x 835
  await page.setViewport({ width: 1728, height: 835 })

  // Click on <a> "Login"
  await page.waitForSelector('[href="/members_login"]')
  await Promise.all([
    page.click('[href="/members_login"]'),
    page.waitForNavigation(),
  ])

  // Fill "4168" on <input> #memberid
  await page.waitForSelector("#memberid:not([disabled])")
  await page.type("#memberid", "4168")

  // Press Tab on input
  await page.waitForSelector("#memberid")
  await page.keyboard.press("Tab")

  // Fill "6052" on <input> #pin
  await page.waitForSelector("#pin:not([disabled])")
  await page.type("#pin", "6052")

  // Click on <input> [name="Submit"]
  await page.waitForSelector('[name="Submit"]')
  await Promise.all([page.click('[name="Submit"]'), page.waitForNavigation()])

  // Scroll wheel by X:0, Y:1580
  await page.evaluate(() => window.scrollBy(0, 1580))

  // Click on <a> "Book a tee time"
  await page.waitForSelector('td > [href="/memberbooking/"]')
  await Promise.all([
    page.click('td > [href="/memberbooking/"]'),
    page.waitForNavigation(),
  ])

  // Click on <input> #date
  await page.waitForSelector("#date")
  await page.click("#date")

  // Click on <a> "13"
  await page.waitForSelector('tr:nth-child(3) > td:nth-child(5) > [href="#"]')
  await page.click('tr:nth-child(3) > td:nth-child(5) > [href="#"]')

  // Scroll wheel by X:0, Y:3646
  await page.evaluate(() => window.scrollBy(0, 3646))

  // Click on <a> "Book"
  await page.waitForSelector(
    '[href="?date=13-12-2024&course=1&group=1&book=18:00:00"]'
  )
  await page.click('[href="?date=13-12-2024&course=1&group=1&book=18:00:00"]')

  // Click on <label> "3"
  await page.waitForSelector("#cluetip-inner .btn:nth-child(3)")
  await page.click("#cluetip-inner .btn:nth-child(3)")

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

  // Click on <a> "Enter Details"
  await page.waitForSelector('tr:nth-child(2) [href="#"]')
  await page.click('tr:nth-child(2) [href="#"]')

  // Click on <a> "ANOTHER MEMBER"
  await page.waitForSelector(
    '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
  )
  await page.click('[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]')

  // Fill "LAI" on <input> .content [name="partner"]
  await page.waitForSelector('.content [name="partner"]:not([disabled])')
  await page.type('.content [name="partner"]', "LAI")

  // Click on <input> .content [name="submit"]
  await page.waitForSelector('.content [name="submit"]')
  await page.click('.content [name="submit"]')

  // Click on <a> "David Laird (40.5)"
  await page.waitForSelector(
    '[href="?edit=4346420&addpartner=10712&partnerslot=2"]',
    { visible: true }
  )

  await Promise.all([
    page.click('[href="?edit=4346420&addpartner=10712&partnerslot=2"]'),
    page.waitForNavigation(),
  ])

  // await browser.close()
})()

const puppeteer = require("puppeteer")
;(async () => {
  const browser = await puppeteer.launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  })
  const page = await browser.newPage()

  // Load "https://www.cgc-ni.com/memberbooking/?edit=4346420&newbooking=1"
  await page.goto(
    "https://www.cgc-ni.com/memberbooking/?edit=4346420&newbooking=1"
  )

  // Resize window to 1728 x 835
  await page.setViewport({ width: 1728, height: 835 })

  // Click on <a> "Enter Details"
  await page.waitForSelector('tr:nth-child(2) [href="#"]')
  await page.click('tr:nth-child(2) [href="#"]')

  // Click on <a> "ANOTHER MEMBER"
  await page.waitForSelector(
    '[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]'
  )
  await page.click('[href="?edit=4346420&memdiv=1#memberdiv&partnerslot=2"]')

  // Fill "LAI" on <input> .content [name="partner"]
  await page.waitForSelector('.content [name="partner"]:not([disabled])')
  await page.type('.content [name="partner"]', "LAI")

  // Click on <input> .content [name="submit"]
  await page.waitForSelector('.content [name="submit"]')
  await page.click('.content [name="submit"]')

  // Click on <a> "David Laird (40.5)"
  await page.waitForSelector(
    '[href="?edit=4346420&addpartner=10712&partnerslot=2"]'
  )
  await Promise.all([
    page.click('[href="?edit=4346420&addpartner=10712&partnerslot=2"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> "Enter Details"
  await page.waitForSelector('[href="#"]')
  await page.click('[href="#"]')

  // Click on <a> "Rodney Ross"
  await page.waitForSelector(
    '[href="?edit=4346420&addpartner=11206&partnerslot=3"]'
  )
  await Promise.all([
    page.click('[href="?edit=4346420&addpartner=11206&partnerslot=3"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> "Buggy Booking (£0.00)"
  await page.waitForSelector('[href="?edit=4346420&addservice=19"]')
  await Promise.all([
    page.click('[href="?edit=4346420&addservice=19"]'),
    page.waitForNavigation(),
  ])

  // Click on <a> "Buggy Booking (£0.00)"
  await page.waitForSelector('[href="?edit=4346420&addservice=19"]')
  await Promise.all([
    page.click('[href="?edit=4346420&addservice=19"]'),
    page.waitForNavigation(),
  ])

  await browser.close()
})()
