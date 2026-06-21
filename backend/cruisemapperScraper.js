import { getBrowser } from "./puppeteerBrowser.js"
import { DatabaseAdapter } from "./databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

const VF_BASE = "https://www.vesselfinder.com"
const LENGTH_TOLERANCE_M = 10
const POLITENESS_MS = 2000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Parse "228 / 29" → 228
const parseSearchLength = (str) => {
  const m = str?.match(/^(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

const ensureImoColumn = async () => {
  try {
    await getDb().run(
      `ALTER TABLE belfastharbour_cruise_schedule ADD COLUMN IF NOT EXISTS imo INTEGER NOT NULL DEFAULT 0`,
    )
  } catch (_) {
    // column already exists — ignore
  }
}

const isTender    = (c) => c.cells.some((cell) => cell.toLowerCase().includes("tender"))
const isPassenger = (c) =>
  c.cells.some(
    (cell) =>
      cell.toLowerCase().includes("passenger") ||
      cell.toLowerCase().includes("cruise"),
  )

const getCandidatesFromPage = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("table tr"))
      .slice(1)
      .map((row) => {
        const link = row.querySelector("a")
        const cells = Array.from(row.querySelectorAll("td")).map((td) =>
          td.textContent.trim(),
        )
        return { href: link?.href ?? null, cells }
      })
      .filter((r) => r.href),
  )

const getNextPageHref = (page) =>
  page.evaluate(() =>
    document.querySelector("a.pagination-next")?.getAttribute("href") ?? null,
  )

const scrapeVesselData = async (page, vesselname, vessellengthmetre) => {
  try {
    // Normalise Unicode quotes to ASCII apostrophe so VesselFinder search works
    // e.g. "L’AUSTRAL" (right single quote) → "L'AUSTRAL"
    const searchName = vesselname.replace(/[‘’‚‛]/g, "'")

    // Pass 1: collect all passenger/cruise candidates across all result pages
    let pageUrl = `${VF_BASE}/vessels?name=${encodeURIComponent(searchName)}`
    const allPassengerCandidates = []
    const allFallbackCandidates  = []

    while (pageUrl) {
      await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 })
      const allOnPage = await getCandidatesFromPage(page)
      const nextHref  = await getNextPageHref(page)

      allOnPage.forEach((c) => {
        if (isTender(c)) return
        if (isPassenger(c)) allPassengerCandidates.push(c)
        else allFallbackCandidates.push(c)
      })

      pageUrl = nextHref ? `${VF_BASE}${nextHref}` : null
    }

    // Pass 2: pick the best candidate and fetch its detail page
    // Length check disambiguates when multiple passenger ships share a name.
    // If there is only ONE passenger/cruise ship across all results, trust it
    // even if VesselFinder's length data is wrong (data quality issue).
    const lengthMatch = (c) => {
      const searchLength = parseSearchLength(c.cells.find((x) => /^\d+\s*\/\s*\d+/.test(x)))
      return (
        vessellengthmetre === null ||
        searchLength === null ||
        Math.abs(searchLength - vessellengthmetre) <= LENGTH_TOLERANCE_M
      )
    }

    const passengersInTolerance = allPassengerCandidates.filter(lengthMatch)
    const fallbacksInTolerance  = allFallbackCandidates.filter(lengthMatch)

    // If no length-matching passenger ship, check whether only one plausibly-sized
    // passenger ship exists across all results (ignoring tiny vessels < 50m that
    // share the "Passenger ship" AIS type). VesselFinder length data is sometimes
    // wrong, so a single unambiguous result is trusted even outside tolerance.
    const plausiblePassengers = allPassengerCandidates.filter((c) => {
      const len = parseSearchLength(c.cells.find((x) => /^\d+\s*\/\s*\d+/.test(x)))
      return len === null || len >= 50
    })
    const singlePassengerFallback =
      passengersInTolerance.length === 0 && plausiblePassengers.length === 1
        ? plausiblePassengers
        : []

    const orderedCandidates = [
      ...passengersInTolerance,
      ...singlePassengerFallback,
      ...fallbacksInTolerance,
    ]

    if (orderedCandidates.length === 0) {
      console.log(`[VF] No matching vessel found for "${vesselname}"`)
      return { mmsi: 0, imo: 0 }
    }

    for (const candidate of orderedCandidates) {
      await page.goto(candidate.href, { waitUntil: "networkidle2", timeout: 30000 })

      const imoMmsi = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("tr"))
        for (const tr of rows) {
          const tds = tr.querySelectorAll("td")
          if (tds.length === 2 && tds[0].textContent.trim() === "IMO / MMSI") {
            return tds[1].textContent.trim()
          }
        }
        return null
      })

      if (!imoMmsi) continue

      const [imoStr, mmsiStr] = imoMmsi.split(" / ")
      const imo  = parseInt(imoStr)  || 0
      const mmsi = parseInt(mmsiStr) || 0

      console.log(`[VF] "${vesselname}" → IMO ${imo}, MMSI ${mmsi}`)
      return { mmsi, imo }
    }

    console.log(`[VF] No length-matching vessel found for "${vesselname}"`)
    return { mmsi: 0, imo: 0 }
  } catch (err) {
    console.warn(`[VF] Scrape failed for "${vesselname}":`, err.message)
    return { mmsi: 0, imo: 0 }
  }
}

export const fetchAndSaveVesselMMSIs = async (vessels) => {
  if (!vessels || vessels.length === 0) return

  console.log(`[VF] Fetching IMO/MMSI for ${vessels.length} vessel(s)`)

  await ensureImoColumn()

  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  )

  try {
    for (const { vesselname, vessellengthmetre } of vessels) {
      const { mmsi, imo } = await scrapeVesselData(page, vesselname, vessellengthmetre)
      await getDb().run(
        `UPDATE belfastharbour_cruise_schedule SET mmsi = ?, imo = ? WHERE vesselname = ?`,
        [mmsi, imo, vesselname],
      )
      await sleep(POLITENESS_MS)
    }
  } finally {
    await page.close()
  }

  console.log("[VF] IMO/MMSI fetch complete")
}
