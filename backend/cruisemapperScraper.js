import puppeteer from "puppeteer"
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

  // DEBUG: process only the first vessel with a visible browser to inspect the dropdown
  const debugVessels = vessels.slice(0, 1)
  console.log(`[CruiseMapper] DEBUG — processing first vessel only: "${debugVessels[0].vesselname}"`)

  const debugBrowser = await puppeteer.launch({ headless: false })
  const page = await debugBrowser.newPage()

  try {
    const { vesselname, vessellengthmetre } = debugVessels[0]

    await page.goto(CRUISEMAPPER_BASE, { waitUntil: "networkidle2", timeout: 30000 })

    // Log all inputs on the page to find the correct search selector
    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map((el) => ({
        id: el.id,
        name: el.name,
        type: el.type,
        placeholder: el.placeholder,
        className: el.className,
      })),
    )
    console.log("[CruiseMapper] Inputs found on page:", JSON.stringify(inputs, null, 2))

    // Find the search input — try common selectors in order
    const searchSelector = await page.evaluate(() => {
      const candidates = [
        'input[name="q"]',
        'input[type="search"]',
        'input[type="text"]',
        'input[placeholder]',
      ]
      for (const sel of candidates) {
        if (document.querySelector(sel)) return sel
      }
      return null
    })
    console.log("[CruiseMapper] Using search selector:", searchSelector)
    if (!searchSelector) throw new Error("Could not find a search input on the CruiseMapper page")

    await page.$eval(searchSelector, (el) => (el.value = ""))
    await page.type(searchSelector, vesselname)

    // Step 3: wait for autocomplete dropdown — then halt
    await page.waitForSelector(".ttMenu", { timeout: 10000 })
    console.log(`[CruiseMapper] Dropdown appeared for "${vesselname}" — halting to inspect`)

    // Capture the current page HTML and open it in a new tab for inspection
    const html = await page.content()
    const inspectTab = await debugBrowser.newPage()
    await inspectTab.setContent(html, { waitUntil: "domcontentloaded" })

    // Keep the browser open for 60 seconds so the user can inspect both tabs
    await new Promise((resolve) => setTimeout(resolve, 60_000))
  } finally {
    await debugBrowser.close()
  }
}
