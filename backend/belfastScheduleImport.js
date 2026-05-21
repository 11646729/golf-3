import { PDFParse } from "pdf-parse"
import { DatabaseAdapter } from "./databaseUtilities.js"
import { getBrowser } from "./puppeteerBrowser.js"

const CRUISE_SCHEDULE_PAGE =
  "https://www.belfast-harbour.co.uk/port/cruise-schedule/"

// -------------------------------------------------------
// Discover the current PDF URL from the schedule page.
// Not hardcoded because WordPress embeds the upload year/month
// in the path and the filename contains the schedule year.
// -------------------------------------------------------
const discoverPdfUrl = async () => {
  const response = await fetch(CRUISE_SCHEDULE_PAGE)
  if (!response.ok)
    throw new Error(`Failed to fetch schedule page: ${response.statusText}`)

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
// Ensure cruiselinelogos exists with the cruiseline column.
// Safe to call on an existing table — ADD COLUMN IF NOT EXISTS is a no-op.
// -------------------------------------------------------
const prepareCruiseLineLogosTable = async () => {
  await getDb().run(`
    CREATE TABLE IF NOT EXISTS cruiselinelogos (
      cruiselinelogoid SERIAL PRIMARY KEY,
      logourl TEXT UNIQUE NOT NULL,
      cruiseline TEXT UNIQUE
    )
  `)
  await getDb().run(
    `ALTER TABLE cruiselinelogos ADD COLUMN IF NOT EXISTS cruiseline TEXT UNIQUE`,
  )
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

// -------------------------------------------------------
// Scrape the CruiseMapper Belfast schedule for the current
// month and the next two months, returning a Map of
// normalized cruise line name → { name, logoUrl }.
// -------------------------------------------------------
const scrapeLogoMapFromCruiseMapper = async () => {
  const logoMap = new Map()
  const portUrl = process.env.BELFAST_PORT_URL
  const baseUrl = process.env.CRUISE_MAPPER_URL
  if (!portUrl || !baseUrl) return logoMap

  const browser = await getBrowser()
  const page = await browser.newPage()
  const now = new Date()

  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const month = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`
    const url = `${baseUrl}${portUrl}?month=${month}#schedule`
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
      const rows = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".portItemSchedule tr"))
          .slice(1)
          .map((tr) => {
            const img = tr.querySelector("img")
            return {
              name: img?.getAttribute("title")?.trim() ?? "",
              logoUrl: img?.getAttribute("src") ?? "",
            }
          })
          .filter((r) => r.name && r.logoUrl),
      )
      for (const { name, logoUrl } of rows) {
        const key = normalizeName(name)
        if (!logoMap.has(key)) logoMap.set(key, { name, logoUrl })
      }
    } catch (err) {
      console.warn(`Failed to scrape CruiseMapper for month ${month}:`, err.message)
    }
  }

  await page.close()
  console.log(`Built CruiseMapper logo map: ${logoMap.size} cruise lines`)
  return logoMap
}

// -------------------------------------------------------
// Resolve a cruise line name to a cruiselinelogoid.
// Checks cruiselinelogos by name first; if not found,
// looks up the logo URL from the CruiseMapper logoMap
// (exact normalized match, then partial), inserts it,
// and returns the new ID.
// -------------------------------------------------------
const getOrCreateCruiseLineLogoId = async (cruiseline, logoMap) => {
  if (!cruiseline) return null

  // 1. Already recorded by name
  const existing = await getDb().get(
    `SELECT cruiselinelogoid FROM cruiselinelogos WHERE LOWER(cruiseline) = LOWER(?)`,
    [cruiseline],
  )
  if (existing) return existing.cruiselinelogoid

  // 2. Find in logoMap — exact normalized match first, then partial
  const key = normalizeName(cruiseline)
  let match = logoMap.get(key)
  if (!match) {
    for (const [k, v] of logoMap) {
      if (k.includes(key) || key.includes(k)) {
        match = v
        break
      }
    }
  }

  if (!match) {
    console.warn(`No CruiseMapper logo found for: ${cruiseline}`)
    return null
  }

  // 3. Upsert — if logourl already exists, set cruiseline only if it was NULL
  await getDb().run(
    `INSERT INTO cruiselinelogos (logourl, cruiseline)
     VALUES (?, ?)
     ON CONFLICT (logourl) DO UPDATE
       SET cruiseline = COALESCE(cruiselinelogos.cruiseline, EXCLUDED.cruiseline)`,
    [match.logoUrl, cruiseline],
  )
  const row = await getDb().get(
    `SELECT cruiselinelogoid FROM cruiselinelogos WHERE logourl = ?`,
    [match.logoUrl],
  )
  return row?.cruiselinelogoid ?? null
}

// -------------------------------------------------------
// Create the table (if it does not exist) and truncate it
// ready for a fresh import.
// -------------------------------------------------------
const prepareBelfastScheduleTable = async () => {
  await prepareCruiseLineLogosTable()
  await getDb().run(`DROP TABLE IF EXISTS belfastharbour_cruise_schedule`)
  await getDb().run(`
    CREATE TABLE belfastharbour_cruise_schedule (
      portarrivalid     SERIAL PRIMARY KEY,
      cruiselinelogoid  INTEGER REFERENCES cruiselinelogos(cruiselinelogoid),
      vesseleta         TIMESTAMPTZ  NOT NULL,
      vesseletd         TIMESTAMPTZ  NOT NULL,
      cruiseline        TEXT         NOT NULL,
      vesselname        TEXT         NOT NULL,
      vessellengthmetre INTEGER,
      berth             TEXT,
      visitors          INTEGER,
      pdfmodifieddate   TIMESTAMPTZ,
      importedat        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `)
  await getDb().run(
    `CREATE INDEX idx_bhcs_eta ON belfastharbour_cruise_schedule(vesseleta)`,
  )
  console.log("belfastharbour_cruise_schedule table ready")
}

// -------------------------------------------------------
// Insert parsed rows into the table.
// -------------------------------------------------------
const saveArrivals = async (arrivals, pdfModDate) => {
  const sql = `
    INSERT INTO belfastharbour_cruise_schedule
      (cruiselinelogoid, vesseleta, vesseletd, cruiseline, vesselname,
       vessellengthmetre, berth, visitors, pdfmodifieddate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  for (const row of arrivals) {
    await getDb().run(sql, [
      row.cruiselinelogoid ?? null,
      row.vesseleta,
      row.vesseletd,
      row.cruiseline,
      row.vesselname,
      row.vessellengthmetre,
      row.berth,
      row.visitors,
      pdfModDate?.toISOString() ?? null,
    ])
  }
  console.log(`${arrivals.length} rows saved to belfastharbour_cruise_schedule`)
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
    console.log("Schedule unchanged — skipping import")
    return { imported: false, modDate, rowCount: 0 }
  }

  const textResult = await parser.getText()
  const arrivals = parseScheduleText(textResult.text)
  console.log(`Parsed ${arrivals.length} arrival rows`)

  await prepareBelfastScheduleTable()

  const logoMap = await scrapeLogoMapFromCruiseMapper()
  for (const row of arrivals) {
    row.cruiselinelogoid = await getOrCreateCruiseLineLogoId(row.cruiseline, logoMap)
  }

  await saveArrivals(arrivals, modDate)

  return { imported: true, modDate, rowCount: arrivals.length }
}
