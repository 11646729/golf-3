const sleep = (ms) => new Promise((res) => setTimeout(res, ms))
export const pagePreparationObject = {
  async loadInitialWebPage(browserInstance, urlString) {
    // Assign browserInstance to browser variable
    let browser = await browserInstance

    // // Load Browser Instance
    let page = await browser.newPage()

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15"
    )

    // Navigate to Initial Web page & wait for it to load
    await page.goto(urlString, { waitUntil: "load" })
    console.log(`Navigated to ${urlString} ...`)

    return page
  },

  // ------------------------------------------------------------------

  async login(pageInstance) {
    // Enter Username & Password
    await pageInstance.waitForSelector("#memberid")
    await pageInstance.type("#memberid", "4168")

    await pageInstance.waitForSelector("#pin")
    await pageInstance.type("#pin", "6052")

    // Submit the Login form and wait for process to complete
    await Promise.all([
      await pageInstance.click('.btn[type="submit"]'),
      pageInstance.waitForNavigation({ waitUntil: "networkidle0" }),
      console.log(`Logged In ...`),
    ])

    // const bookingUrl = "https://www.cgc-ni.com/memberbooking/"
    // await page.goto(bookingUrl, { waitUntil: "load" })

    // await page.waitForSelector(
    //   "#myteetimes > table > tbody > tr:nth-child(7) > td > a"
    // )
    // let applicationLink = "/memberbooking/"
    // await page.click(`a[href='${applicationLink}']`)
    // const bookingUrl = "https://www.cgc-ni.com/memberbooking/"
    // await page.goto(bookingUrl)
    // // Wait for the div to load if necessary
    // await page.waitForSelector(
    //   "#content > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-7999ad4.elementor-section-boxed.elementor-section-height-default > div > div > div > div.elementor-element.elementor-element-1397594.elementor-widget.elementor-widget-shortcode > div"
    // )
    // let page = await pageInstance
    // // Now Accept all Cookies
    // const acceptCookiesButtonString = ".cc-cookie-accept"
    // const acceptCookiesButton = await page.$(acceptCookiesButtonString)
    // // Check if the Accept Cookies button is disabled or non-existent
    // const isAcceptCookiesDisabled = await page.$eval(
    //   acceptCookiesButtonString,
    //   (button) => button.disabled
    // )
    // // If the Accept Cookies button exists then press it
    // if (!isAcceptCookiesDisabled) {
    //   await acceptCookiesButton.click()
    //   console.log("Accept cookies button pressed")
    // }
  },

  // ------------------------------------------------------------------

  async loadNextPages(pageInstance) {
    let page = await pageInstance
    let hasLoadMoreButton = true

    // Now load more data
    const loadMoreButtonString =
      "#content > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-7999ad4.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div > div > div.elementor-element.elementor-element-1397594.elementor-widget.elementor-widget-shortcode > div > div > div > button"

    const loadMoreButton = await page.$(loadMoreButtonString)

    while (hasLoadMoreButton)
      try {
        // Check if the Load More button is disabled or non-existent
        const isLoadMoreButtonDisabled = await page.$eval(
          loadMoreButtonString,
          (button) => button.disabled
        )

        // If the Load More button exists then press it
        if (isLoadMoreButtonDisabled) {
          console.log(
            "Load More button is disabled or missing, stopping navigation"
          )
          hasLoadMoreButton = false
        } else {
          // Click the Load More button
          await loadMoreButton.click()
          console.log("Load More button pressed")
        }

        // Wait for the page to load new content
        await sleep(1000)
      } catch {
        console.log("Load More button not found, stopping navigation")
        hasLoadMoreButton = false
      }
  },

  // ------------------------------------------------------------------
}
