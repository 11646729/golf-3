import { getBrowser } from "./puppeteerBrowser.js"
import { DatabaseAdapter } from "./databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

const CRUISEMAPPER_BASE = "https://www.cruisemapper.com"
const LENGTH_TOLERANCE_M = 10

const parseLength = (str) => {
  const m = str.match(/\d+/)
  return m ? parseInt(m[0]) : null
}

const scrapeMMSIForVessel = async (page, vesselname, vessellengthmetre) => {
  try {
    // Use the CruiseMapper live search box which shows an autocomplete dropdown
    // with results grouped under a "Cruise Ships" heading
    await page.goto(CRUISEMAPPER_BASE, { waitUntil: "networkidle2", timeout: 30000 })

    // Clear any previous search text then type the vessel name
    await page.$eval('input[name="q"]', (el) => (el.value = ""))
    await page.type('input[name="q"]', vesselname)

    // Wait for the autocomplete dropdown to appear
    await page.waitForSelector(".ttMenu", { timeout: 10000 })

    // Find links inside the "Cruise Ships" section of the dropdown
    const shipUrls = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll(".ttMenu .ttDataset"))
      const cruiseSection = sections.find((s) =>
        s.querySelector(".ttHeading")?.textContent?.trim() === "Cruise Ships",
      )
      if (!cruiseSection) return []
      return Array.from(cruiseSection.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter(Boolean)
        .slice(0, 3)
    })

    if (shipUrls.length === 0) {
      console.log(`[CruiseMapper] No "Cruise Ships" results for "${vesselname}"`)
      return 0
    }

    console.log(`[CruiseMapper] Search results for "${vesselname}":`, shipUrls)

    for (const vesselUrl of shipUrls) {
      await page.goto(vesselUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      })

      const data = await page.evaluate(() => {
        const getTdNext = (label) => {
          const td = Array.from(document.querySelectorAll("td")).find(
            (t) => t.textContent.trim() === label,
          )
          return td?.nextElementSibling?.textContent?.trim() ?? ""
        }
        return {
          mmsi: getTdNext("MMSI"),
          length: getTdNext("Length (LOA)"),
        }
      })

      const scrapedLength = parseLength(data.length)
      const mmsi = parseInt(data.mmsi) || 0

      // Accept if DB has no length, or CruiseMapper has no length, or lengths match within tolerance
      if (
        vessellengthmetre === null ||
        scrapedLength === null ||
        Math.abs(scrapedLength - vessellengthmetre) <= LENGTH_TOLERANCE_M
      ) {
        console.log(
          `[CruiseMapper] "${vesselname}" → MMSI ${mmsi} (CruiseMapper length: ${scrapedLength}m, schedule length: ${vessellengthmetre}m)`,
        )
        return mmsi
      }

      console.log(
        `[CruiseMapper] Length mismatch for "${vesselname}" at ${vesselUrl}: expected ${vessellengthmetre}m, got ${scrapedLength}m — trying next result`,
      )
    }

    console.log(
      `[CruiseMapper] No length-matching result found for "${vesselname}"`,
    )
    return 0
  } catch (err) {
    console.warn(
      `[CruiseMapper] Scrape failed for "${vesselname}":`,
      err.message,
    )
    return 0
  }
}

export const fetchAndSaveVesselMMSIs = async (vessels) => {
  if (!vessels || vessels.length === 0) return

  console.log(`[CruiseMapper] Fetching MMSIs for ${vessels.length} vessel(s)`)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    for (const { vesselname, vessellengthmetre } of vessels) {
      const mmsi = await scrapeMMSIForVessel(
        page,
        vesselname,
        vessellengthmetre,
      )
      await getDb().run(
        `UPDATE belfastharbour_cruise_schedule SET mmsi = ? WHERE vesselname = ?`,
        [mmsi, vesselname],
      )
    }
  } finally {
    await page.close()
  }

  console.log("[CruiseMapper] MMSI fetch complete")
}
