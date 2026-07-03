import { PDFParse } from "pdf-parse"
import { DatabaseAdapter } from "./databaseUtilities.js"
import { getBrowser } from "./puppeteerBrowser.js"
import { fetchAndSaveVesselMMSIs, fetchAndSaveVesselSpecs } from "./cruisemapperScraper.js"

const CRUISE_SCHEDULE_PAGE =
  "https://www.belfast-harbour.co.uk/port/cruise-schedule/"

// -------------------------------------------------------
// Discover the current PDF URL from the schedule page.
// Not hardcoded because WordPress embeds the upload year/month
// in the path and the filename contains the schedule year.
// -------------------------------------------------------
const discoverPdfUrl = async () => {
  let response
  try {
    response = await fetch(CRUISE_SCHEDULE_PAGE)
  } catch (err) {
    throw new Error(`Cannot reach Belfast Harbour website: ${err.message}`)
  }
  if (!response.ok)
    throw new Error(
      `Belfast Harbour website returned an error (${response.status} ${response.statusText}). Please try again later.`,
    )

  const html = await response.text()
  const match = html.match(
    /https:\/\/www\.belfast-harbour\.co\.uk\/wp-content\/uploads\/\d{4}\/\d{2}\/Belfast-Harbour-Cruise-Schedule-\d{4}\.pdf/,
  )
  if (!match) throw new Error("Cruise schedule PDF link not found on page")
  return match[0]
}

// -------------------------------------------------------
// Convert a PDF date string to a JS Date.
// PDF format: D:YYYYMMDDHHmmSSOHH'mm'  e.g. "D:20260318122132Z"
// -------------------------------------------------------
const parsePdfDate = (pdfDate) => {
  const m = pdfDate?.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/)
  if (!m) return null
  const [, year, month, day, hour, min, sec] = m
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`)
}

// -------------------------------------------------------
// Parse the PDF text into structured arrival rows.
//
// Each data row is tab-separated:
//   DD/MM/YYYY  \t  HH:MM-HH:MM  \t  CRUISE LINE  \t  VESSEL  \t  LEN  \t  BERTH  \t  VISITORS
//
// Overnight stays span two source lines — merged before parsing:
//   DD/MM/YYYY -
//   DD/MM/YYYY HH:MM-HH:MM  \t  CRUISE LINE  ...
// -------------------------------------------------------
const toIsoDate = (ddmmyyyy) => {
  const [dd, mm, yyyy] = ddmmyyyy.split("/")
  return `${yyyy}-${mm}-${dd}`
}

const parseScheduleText = (text) => {
  const arrivals = []
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  // Merge "DD/MM/YYYY -" lines with the following line
  const merged = []
  for (let i = 0; i < lines.length; i++) {
    if (/^\d{2}\/\d{2}\/\d{4}\s+-$/.test(lines[i])) {
      merged.push(lines[i] + " " + (lines[i + 1] || ""))
      i++
    } else {
      merged.push(lines[i])
    }
  }

  const multiDayPattern =
    /^(\d{2}\/\d{2}\/\d{4})\s+-\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/
  const timePattern = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/

  for (const line of merged) {
    const parts = line
      .split("\t")
      .map((s) => s.trim())
      .filter(Boolean)

    let arrivaldate, departuredate, eta, etd, rest

    const rangeMatch = multiDayPattern.exec(parts[0])
    if (rangeMatch && parts.length >= 5) {
      // Overnight: "14/06/2026 - 15/06/2026 08:00-17:00" in parts[0]
      arrivaldate = toIsoDate(rangeMatch[1])
      departuredate = toIsoDate(rangeMatch[2])
      eta = rangeMatch[3]
      etd = rangeMatch[4]
      rest = parts.slice(1)
    } else if (datePattern.test(parts[0]) && parts.length >= 6) {
      // Single-day: parts[0] = date, parts[1] = "HH:MM-HH:MM"
      const timeMatch = timePattern.exec(parts[1])
      if (!timeMatch) continue
      arrivaldate = toIsoDate(parts[0])
      departuredate = arrivaldate
      eta = timeMatch[1]
      etd = timeMatch[2]
      rest = parts.slice(2)
    } else {
      continue // header row, page marker, or non-data line
    }

    if (rest.length < 5) continue

    arrivals.push({
      vesseleta: `${arrivaldate}T${eta}:00`,
      vesseletd: `${departuredate}T${etd}:00`,
      cruiseline: rest[0],
      vesselname: rest[1],
      vessellengthmetre: parseInt(rest[2]) || null,
      berth: rest[3],
      visitors: parseInt(rest[4].replace(/,/g, "")) || null,
    })
  }

  return arrivals
}

// -------------------------------------------------------
// Database
// -------------------------------------------------------
let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

// -------------------------------------------------------
// Look up MMSI/IMO on VesselFinder for any vessel with upcoming
// arrivals that is still missing either value.
// -------------------------------------------------------
const fetchMissingMMSIs = async () => {
  const vessels = await getDb().all(
    `SELECT vesselname, vessellengthmetre
     FROM vessels
     WHERE mmsi = 0 OR imo = 0
     ORDER BY vesselname`,
  )
  if (vessels.length > 0) {
    console.log(`[MMSI] ${vessels.length} vessel(s) need MMSI/IMO lookup`)
    await fetchAndSaveVesselMMSIs(vessels)
  }
}

// -------------------------------------------------------
// Scrape build year / speed / last-refurbishment specs from CruiseMapper for
// any vessel still missing them. Gated on speed/yearofbuild (always present on
// CruiseMapper) so vessels with no listed refurbishment aren't re-scraped every run.
// -------------------------------------------------------
const fetchMissingSpecs = async () => {
  const vessels = await getDb().all(
    `SELECT vesselname
     FROM vessels
     WHERE speed IS NULL OR yearofbuild IS NULL
     ORDER BY vesselname`,
  )
  if (vessels.length > 0) {
    console.log(`[CM] ${vessels.length} vessel(s) need specs lookup`)
    await fetchAndSaveVesselSpecs(vessels)
  }
}

// -------------------------------------------------------
// Normalize a cruise line name for fuzzy matching:
// lowercase, collapse non-alphanumeric runs to single spaces.
// -------------------------------------------------------
const normalizeName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

// Belfast Harbour PDF uses abbreviations that differ from CruiseMapper full names.
const CRUISE_LINE_ALIASES = new Map([
  ["ncl", "norwegian cruise line"],
  ["hal", "holland america"],
  ["focl", "fred olsen cruise lines"],
])

// -------------------------------------------------------
// Scrape the CruiseMapper cruise lines directory and return
// a Map of normalized cruise line name → { name, logoUrl }.
// Each img has title="[Name] cruise line" so we strip the
// trailing " cruise line" suffix before normalizing.
// -------------------------------------------------------
const scrapeLogoMapFromCruiseMapper = async () => {
  const logoMap = new Map()
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto("https://www.cruisemapper.com/cruise-lines/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    const entries = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img[title]"))
        .map((img) => ({
          title: img.getAttribute("title")?.trim() ?? "",
          logoUrl: img.getAttribute("src") ?? "",
        }))
        .filter((e) => e.title && e.logoUrl),
    )

    for (const { title, logoUrl } of entries) {
      const name = title.replace(/\s+cruise line$/i, "").trim()
      const key = normalizeName(name)
      if (!logoMap.has(key)) logoMap.set(key, { name, logoUrl })
    }
  } catch (err) {
    console.warn(
      "Failed to scrape CruiseMapper cruise lines directory:",
      err.message,
    )
  }

  await page.close()
  console.log(`Built CruiseMapper logo map: ${logoMap.size} cruise lines`)
  return logoMap
}

// -------------------------------------------------------
// Resolve a cruise line name to a logo URL via the
// directory logoMap (exact normalized match, then partial).
// Returns null if not found — caller should fall back to
// vessel search.
// -------------------------------------------------------
const resolveCruiseLineLogoUrl = (cruiseline, logoMap) => {
  if (!cruiseline) return null

  const key =
    CRUISE_LINE_ALIASES.get(normalizeName(cruiseline)) ??
    normalizeName(cruiseline)
  let match = logoMap.get(key)
  if (!match) {
    for (const [k, v] of logoMap) {
      if (k.includes(key) || key.includes(k)) {
        match = v
        break
      }
    }
  }

  return match?.logoUrl ?? null
}

// -------------------------------------------------------
// Search CruiseMapper ships by vessel name and return the
// logo URL for the operating cruise line.
// The cruise line link on the results page follows the
// pattern /cruise-lines/Name-ID, so the ID gives us the
// icon URL directly with no second request needed.
// -------------------------------------------------------
const lookupLogoViaVesselSearch = async (page, vesselname) => {
  try {
    const query = encodeURIComponent(vesselname)
    await page.goto(`https://www.cruisemapper.com/ships/?name=${query}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    })
    const href = await page.evaluate(() => {
      // The page has a cruise line filter dropdown at the top whose links
      // would be matched first — skip it by finding the first cruise line
      // link that appears after the first ship result link in document order.
      const shipLink = document.querySelector('a[href*="/ships/"]')
      if (!shipLink) return null
      const cruiseLineLink = Array.from(
        document.querySelectorAll('a[href*="/cruise-lines/"]'),
      ).find(
        (a) =>
          shipLink.compareDocumentPosition(a) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      )
      return cruiseLineLink?.getAttribute("href") ?? null
    })
    if (!href) return null
    const idMatch = href.match(/-(\d+)$/)
    if (!idMatch) return null
    return `https://www.cruisemapper.com/images/lines/icons/${idMatch[1]}-60w.png`
  } catch (err) {
    console.warn(`Vessel search failed for "${vesselname}":`, err.message)
    return null
  }
}

// -------------------------------------------------------
// Update cruiselinelogo for any rows in
// belfastharbour_cruise_schedule that don't have one yet.
// First tries the CruiseMapper directory; falls back to
// searching by vessel name for unmatched cruise lines.
// -------------------------------------------------------
const updateExistingLogos = async () => {
  const rows = await getDb().all(
    `SELECT DISTINCT cruiseline FROM belfastharbour_cruise_schedule WHERE cruiselinelogo IS NULL`,
  )
  if (rows.length === 0) return

  console.log(`Updating logos for ${rows.length} unlinked cruise lines`)
  const logoMap = await scrapeLogoMapFromCruiseMapper()

  const browser = await getBrowser()
  const searchPage = await browser.newPage()

  for (const { cruiseline } of rows) {
    let logoUrl = resolveCruiseLineLogoUrl(cruiseline, logoMap)

    if (!logoUrl) {
      const vessel = await getDb().get(
        `SELECT v.vesselname
         FROM belfastharbour_cruise_schedule s
         JOIN vessels v ON v.vesselid = s.vesselid
         WHERE s.cruiseline = ? LIMIT 1`,
        [cruiseline],
      )
      if (vessel) {
        logoUrl = await lookupLogoViaVesselSearch(searchPage, vessel.vesselname)
      }
    }

    if (logoUrl) {
      await getDb().run(
        `UPDATE belfastharbour_cruise_schedule SET cruiselinelogo = ? WHERE cruiseline = ? AND cruiselinelogo IS NULL`,
        [logoUrl, cruiseline],
      )
    }
  }

  await searchPage.close()
}

// -------------------------------------------------------
// Create supporting tables (vessels, vesselpositions) if they
// don't exist, then drop and recreate the schedule table.
// vessels and vesselpositions are never dropped — they persist
// across imports so MMSI/IMO data and AIS positions are kept.
// -------------------------------------------------------
const prepareBelfastScheduleTable = async () => {
  await getDb().run(`
    CREATE TABLE IF NOT EXISTS vessels (
      vesselid          SERIAL PRIMARY KEY,
      vesselname        TEXT    NOT NULL UNIQUE,
      vessellengthmetre INTEGER,
      mmsi              INTEGER NOT NULL DEFAULT 0,
      imo               INTEGER NOT NULL DEFAULT 0
    )
  `)

  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS yearofbuild INTEGER`)
  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS speed TEXT`)
  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS lastrefurbishment TEXT`)

  await getDb().run(`
    CREATE TABLE IF NOT EXISTS vesselpositions (
      vesselid   INTEGER PRIMARY KEY REFERENCES vessels(vesselid),
      recordedat TIMESTAMPTZ      NOT NULL,
      latitude   DOUBLE PRECISION,
      longitude  DOUBLE PRECISION,
      sog        DOUBLE PRECISION,
      cog        DOUBLE PRECISION,
      heading    DOUBLE PRECISION,
      navstatus  TEXT,
      geom       geometry(Point, 4326)
    )
  `)
  await getDb().run(`
    CREATE INDEX IF NOT EXISTS idx_vesselpositions_geom ON vesselpositions USING GIST(geom)
  `)

  await getDb().run(`DROP TABLE IF EXISTS belfastharbour_cruise_schedule`)
  await getDb().run(`
    CREATE TABLE belfastharbour_cruise_schedule (
      portarrivalid   SERIAL PRIMARY KEY,
      vesselid        INTEGER     NOT NULL REFERENCES vessels(vesselid),
      cruiselinelogo  TEXT,
      vesseleta       TIMESTAMPTZ NOT NULL,
      vesseletd       TIMESTAMPTZ NOT NULL,
      cruiseline      TEXT        NOT NULL,
      berth           TEXT,
      visitors        INTEGER,
      pdfmodifieddate TIMESTAMPTZ,
      importedat      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await getDb().run(
    `CREATE INDEX idx_bhcs_eta      ON belfastharbour_cruise_schedule(vesseleta)`,
  )
  await getDb().run(
    `CREATE INDEX idx_bhcs_vesselid ON belfastharbour_cruise_schedule(vesselid)`,
  )
  console.log("Tables ready for import")
}

// -------------------------------------------------------
// Insert parsed rows into vessels (upsert) and schedule table.
// Upserting vessels preserves existing MMSI/IMO across imports.
// -------------------------------------------------------
const saveArrivals = async (arrivals, pdfModDate) => {
  for (const row of arrivals) {
    const vessel = await getDb().get(
      `INSERT INTO vessels (vesselname, vessellengthmetre)
       VALUES (?, ?)
       ON CONFLICT (vesselname) DO UPDATE SET vessellengthmetre = EXCLUDED.vessellengthmetre
       RETURNING vesselid`,
      [row.vesselname, row.vessellengthmetre],
    )

    await getDb().run(
      `INSERT INTO belfastharbour_cruise_schedule
         (vesselid, cruiselinelogo, vesseleta, vesseletd, cruiseline, berth, visitors, pdfmodifieddate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vessel.vesselid,
        row.cruiselinelogo ?? null,
        row.vesseleta,
        row.vesseletd,
        row.cruiseline,
        row.berth,
        row.visitors,
        pdfModDate?.toISOString() ?? null,
      ],
    )
  }
  console.log(`${arrivals.length} rows saved to belfastharbour_cruise_schedule`)
}

// -------------------------------------------------------
// Ensure the vessels table has the spec columns added in v1.1.
// Safe to call on every startup — uses IF NOT EXISTS.
// -------------------------------------------------------
export const ensureVesselsSchema = async () => {
  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS yearofbuild INTEGER`)
  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS speed TEXT`)
  await getDb().run(`ALTER TABLE vessels ADD COLUMN IF NOT EXISTS lastrefurbishment TEXT`)
}

// -------------------------------------------------------
// Retrieve the ModDate of the last successful import.
// Returns a Date or null if the table is empty.
// No separate tracking table needed — pdfmodifieddate is stored on every row.
// -------------------------------------------------------
export const getLastPdfModDate = async () => {
  try {
    const row = await getDb().get(
      `SELECT MAX(pdfmodifieddate) AS lastmod FROM belfastharbour_cruise_schedule`,
    )
    return row?.lastmod ? new Date(row.lastmod) : null
  } catch (err) {
    if (err.message?.includes("does not exist")) return null
    throw err
  }
}

// -------------------------------------------------------
// Main export: discover the current PDF URL, check ModDate,
// and import only if the PDF has been updated.
//
// Returns { imported: boolean, modDate: Date, rowCount: number }
// -------------------------------------------------------
export const importBelfastScheduleFromPdf = async () => {
  const pdfUrl = await discoverPdfUrl()
  console.log("PDF URL:", pdfUrl)

  // Use the URL directly — PDFParse v2 public API does not accept a buffer
  const parser = new PDFParse({ url: pdfUrl })

  const infoResult = await parser.getInfo()
  const modDate = parsePdfDate(infoResult.info?.ModDate)
  console.log("PDF ModDate:", modDate)

  const lastKnownModDate = await getLastPdfModDate()
  if (lastKnownModDate && modDate <= lastKnownModDate) {
    console.log("Schedule unchanged — checking for missing logos and MMSI/IMO")
    await updateExistingLogos()
    await fetchMissingMMSIs()
    await fetchMissingSpecs()
    console.log("Import complete — schedule unchanged")
    return { imported: false, modDate, rowCount: 0 }
  }

  const textResult = await parser.getText()
  const arrivals = parseScheduleText(textResult.text)
  console.log(`Parsed ${arrivals.length} arrival rows`)

  await prepareBelfastScheduleTable()

  const logoMap = await scrapeLogoMapFromCruiseMapper()

  const browser = await getBrowser()
  const searchPage = await browser.newPage()
  const searchCache = new Map()

  for (const row of arrivals) {
    row.cruiselinelogo = resolveCruiseLineLogoUrl(row.cruiseline, logoMap)

    if (!row.cruiselinelogo) {
      if (searchCache.has(row.cruiseline)) {
        row.cruiselinelogo = searchCache.get(row.cruiseline)
      } else {
        const logoUrl = await lookupLogoViaVesselSearch(
          searchPage,
          row.vesselname,
        )
        searchCache.set(row.cruiseline, logoUrl)
        row.cruiselinelogo = logoUrl
      }
    }
  }

  await searchPage.close()
  await saveArrivals(arrivals, modDate)
  await fetchMissingMMSIs()
  await fetchMissingSpecs()
  console.log("Import complete —", arrivals.length, "arrivals saved")

  return { imported: true, modDate, rowCount: arrivals.length }
}
