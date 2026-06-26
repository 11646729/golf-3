import { getBrowser } from "./puppeteerBrowser.js"
import { DatabaseAdapter } from "./databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

const VF_BASE = "https://www.vesselfinder.com"
const CM_BASE = "https://www.cruisemapper.com"
const LENGTH_TOLERANCE_M = 10
const POLITENESS_MS = 2000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Parse "228 / 29" → 228
const parseSearchLength = (str) => {
  const m = str?.match(/^(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
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

// -------------------------------------------------------
// CruiseMapper position scraping
// -------------------------------------------------------
// CruiseMapper embeds position data in every vessel detail page inside
// a `var options = { ... "shipCurrentPositionMap": { "lat": N, "lon": N, ... } ... }`
// script block.  The full ship list is returned as JSON when /ships loads,
// so we intercept that response to resolve vessel name → URL, then navigate
// to the vessel page and pull the coordinates out of the inline script.

const extractShipCurrentPositionMap = async (page) => {
  return page.evaluate(() => {
    for (const s of document.querySelectorAll("script:not([src])")) {
      const m = s.textContent.match(/"shipCurrentPositionMap"\s*:\s*(\{[^}]+\})/)
      if (m) {
        try { return JSON.parse(m[1]) } catch { return null }
      }
    }
    return null
  })
}

const scrapePositionFromCruiseMapper = async (page, vesselname) => {
  console.log(`[CM] Searching for "${vesselname}" on CruiseMapper`)

  // The /ships page auto-loads a full ship-list JSON (/ship/search.json).
  // Intercept it to find the vessel URL without having to interact with JS UI.
  let vesselUrl = null

  const onResponse = async (response) => {
    if (!response.url().includes("ship/search.json")) return
    try {
      const body = await response.text()
      if (!body) return
      const list = JSON.parse(body)
      const lc = vesselname.toLowerCase()
      const match = list.find((s) => s.name?.toLowerCase().includes(lc))
      if (match) vesselUrl = match.url
    } catch { /* ignore parse errors */ }
  }

  page.on("response", onResponse)
  await page.goto(`${CM_BASE}/ships`, { waitUntil: "networkidle2", timeout: 30000 })
  page.off("response", onResponse)

  if (!vesselUrl) {
    console.log(`[CM] "${vesselname}" not found in CruiseMapper ship list`)
    return null
  }

  console.log(`[CM] Found vessel page: ${vesselUrl}`)
  await page.goto(vesselUrl, { waitUntil: "networkidle2", timeout: 30000 })

  const posData = await extractShipCurrentPositionMap(page)

  if (!posData || posData.lat == null || posData.lon == null) {
    console.log(`[CM] No position data found for "${vesselname}"`)
    return null
  }

  const lat = parseFloat(posData.lat)
  const lng = parseFloat(posData.lon)   // CruiseMapper uses "lon"
  const heading = posData.rotation != null ? parseFloat(posData.rotation) : null

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log(`[CM] Invalid coordinates for "${vesselname}": ${posData.lat}, ${posData.lon}`)
    return null
  }

  console.log(`[CM] "${vesselname}" position: lat ${lat}, lng ${lng}, heading ${heading}`)
  return { lat, lng, heading }
}

// Scrape current position for a named vessel from CruiseMapper and save it to the
// vesselpositions table. Emits vesselPositionUpdated via Socket.IO when successful.
export const fetchAndSaveVesselPositionFromWeb = async (vesselname, io) => {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  )

  try {
    const coords = await scrapePositionFromCruiseMapper(page, vesselname)
    if (!coords) return { success: false, reason: "Position not found on CruiseMapper" }

    const { lat, lng, heading } = coords
    const recordedat = new Date().toISOString()

    const result = await getDb().run(
      `INSERT INTO vesselpositions (vesselid, recordedat, latitude, longitude, heading, geom)
       SELECT vesselid, ?, ?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)
       FROM vessels WHERE UPPER(vesselname) = UPPER(?)
       ON CONFLICT (vesselid) DO UPDATE SET
         recordedat = EXCLUDED.recordedat,
         latitude   = EXCLUDED.latitude,
         longitude  = EXCLUDED.longitude,
         heading    = EXCLUDED.heading,
         geom       = EXCLUDED.geom`,
      [recordedat, lat, lng, heading, lng, lat, vesselname],
    )

    if (result.changes > 0 && io) {
      const vessel = await getDb().get(
        `SELECT mmsi FROM vessels WHERE UPPER(vesselname) = UPPER(?)`,
        [vesselname],
      )
      io.emit("vesselPositionUpdated", {
        mmsi: vessel?.mmsi ?? null,
        vesselname,
        lat,
        lng,
        sog: null,
        cog: null,
        heading,
        navstatus: null,
        recordedat,
      })
    }

    return { success: true, lat, lng }
  } finally {
    await page.close()
  }
}

export const fetchAndSaveVesselMMSIs = async (vessels) => {
  if (!vessels || vessels.length === 0) return

  console.log(`[VF] Fetching IMO/MMSI for ${vessels.length} vessel(s)`)

  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  )

  try {
    for (const { vesselname, vessellengthmetre } of vessels) {
      const { mmsi, imo } = await scrapeVesselData(page, vesselname, vessellengthmetre)
      await getDb().run(
        `UPDATE vessels SET mmsi = ?, imo = ? WHERE vesselname = ?`,
        [mmsi, imo, vesselname],
      )
      await sleep(POLITENESS_MS)
    }
  } finally {
    await page.close()
  }

  console.log("[VF] IMO/MMSI fetch complete")
}
