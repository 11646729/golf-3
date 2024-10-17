export const pageScraperObject = {
  async scrapeVesselArrivalDetails1(pageInstance) {
    let page = await pageInstance

    // Wait for the table to load if necessary
    await page.waitForSelector("#load_data")

    let tableData0 = {}

    // Scrape the table data
    tableData0 = await page.evaluate(() => {
      // Get all the rows from the table
      const rows0 = Array.from(
        document.querySelectorAll("#load_data tr:nth-child(4n+1)")
      )

      // Map through each row and get the cell data
      return rows0.map((row0) => {
        const cells0 = Array.from(row0.querySelectorAll("td")) // day-call or textBlue
        return cells0.map((cell0) => cell0.innerText.trim())
      })
    })

    return tableData0
  },

  // ------------------------------------------------------------------
  async scrapeVesselArrivalDetails2(pageInstance) {
    let page = await pageInstance

    // Scrape the table data
    const tableData1 = await page.evaluate(() => {
      // Get all the rows from the table
      const rows = Array.from(
        document.querySelectorAll("#load_data tr:nth-child(4n+2)")
      )

      // Map through each row and get the cell data
      return rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("p"))
        return cells.map((cell) => cell.innerText.trim())
      })
    })

    return tableData1
  },

  // ------------------------------------------------------------------
  async scrapeVesselArrivalDetails3(pageInstance) {
    let page = await pageInstance

    // Fetch the src attribute of the image of the vessel
    const imgSrcs = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("#load_data tr:nth-child(4n+2) img")
      ).map((img) => img.src)
    })

    return imgSrcs
  },
}
