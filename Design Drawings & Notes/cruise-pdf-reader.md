# Belfast Harbour Cruise Schedule PDF Reader

Downloads the Belfast Harbour Cruise Schedule PDF, checks whether it has been
updated since the last import using the PDF `ModDate` metadata field, parses the
schedule table from the text, and saves the rows to a PostgreSQL table.

The PDF URL changes every year (WordPress embeds the upload year/month in the path
and the filename contains the schedule year), so the URL is discovered dynamically
by scraping the cruise schedule page.

## PDF structure

Each schedule row is tab-separated with these columns:

```
Date            Time          Cruise Line  Vessel           Length(m)  Berth                    Visitors
16/01/2026      07:30-18:30   FOCL         BOLETTE          237        Belfast Cruise Terminal   1985
```

Overnight stays span two lines — the first ends with ` -` and the second starts
with the departure date:

```
14/06/2026 -
15/06/2026 08:00-17:00    GRAND CIRCLE    CORINTHIAN    88    Gotto    168
```

The 2026 PDF contains 141 scheduled calls across 11 pages. ModDate confirmed as
`D:20260318122132Z` (18 March 2026, created with Adobe InDesign 21.2).

## Dependencies

```bash
npm install pdf-parse   # already in backend/package.json
```

The v2 API uses `PDFParse` as a class, not a function. Pass `{ url }` — the buffer
constructor option is not part of the v2 public API:

```js
import { PDFParse } from 'pdf-parse'
```

## Database table

`pdfmoddate` is stored on every row, so `MAX(pdfmoddate)` serves as the last-import
marker — no separate tracking table is needed.

```sql
CREATE TABLE IF NOT EXISTS belfastharbour_cruise_schedule (
  id               SERIAL PRIMARY KEY,
  arrivaldate      DATE         NOT NULL,
  departuredate    DATE         NOT NULL,
  eta              TIME         NOT NULL,
  etd              TIME         NOT NULL,
  cruiseline       TEXT         NOT NULL,
  vesselname       TEXT         NOT NULL,
  vessellengthmetre INTEGER,
  berth            TEXT,
  visitors         INTEGER,
  pdfmoddate       TIMESTAMPTZ,
  importedat       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bhcs_arrivaldate
  ON belfastharbour_cruise_schedule(arrivaldate);
```

## Relationship to existing cruise data

This table is separate from `portarrivals` (populated by CruiseMapper scraping):

| | `portarrivals` | `belfastharbour_cruise_schedule` |
|---|---|---|
| Source | CruiseMapper (scraped) | Belfast Harbour official PDF |
| Vessel detail URLs | Yes — used for position tracking | No |
| Vessel length | No | Yes |
| Visitor count | No | Yes |
| UN LOCODE / coordinates | Yes | No |
| Update frequency | On demand via import button | Only when Belfast Harbour publish a new PDF |

## Complete import module (`backend/belfastScheduleImport.js`)

```js
import { PDFParse } from 'pdf-parse'
import { DatabaseAdapter } from './databaseUtilities.js'

const CRUISE_SCHEDULE_PAGE = 'https://www.belfast-harbour.co.uk/port/cruise-schedule/'

// -------------------------------------------------------
// Discover the current PDF URL from the schedule page.
// Not hardcoded because WordPress embeds the upload year/month
// in the path and the filename contains the schedule year.
// -------------------------------------------------------
const discoverPdfUrl = async () => {
  const response = await fetch(CRUISE_SCHEDULE_PAGE)
  if (!response.ok) throw new Error(`Failed to fetch schedule page: ${response.statusText}`)

  const html = await response.text()
  const match = html.match(
    /https:\/\/www\.belfast-harbour\.co\.uk\/wp-content\/uploads\/\d{4}\/\d{2}\/Belfast-Harbour-Cruise-Schedule-\d{4}\.pdf/
  )
  if (!match) throw new Error('Cruise schedule PDF link not found on page')
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
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm}-${dd}`
}

const parseScheduleText = (text) => {
  const arrivals = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Merge "DD/MM/YYYY -" lines with the following line
  const merged = []
  for (let i = 0; i < lines.length; i++) {
    if (/^\d{2}\/\d{2}\/\d{4}\s+-$/.test(lines[i])) {
      merged.push(lines[i] + ' ' + (lines[i + 1] || ''))
      i++
    } else {
      merged.push(lines[i])
    }
  }

  const multiDayPattern = /^(\d{2}\/\d{2}\/\d{4})\s+-\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/
  const timePattern     = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/
  const datePattern     = /^\d{2}\/\d{2}\/\d{4}$/

  for (const line of merged) {
    const parts = line.split('\t').map((s) => s.trim()).filter(Boolean)

    let arrivaldate, departuredate, eta, etd, rest

    const rangeMatch = multiDayPattern.exec(parts[0])
    if (rangeMatch && parts.length >= 5) {
      // Overnight: "14/06/2026 - 15/06/2026 08:00-17:00" in parts[0]
      arrivaldate   = toIsoDate(rangeMatch[1])
      departuredate = toIsoDate(rangeMatch[2])
      eta           = rangeMatch[3]
      etd           = rangeMatch[4]
      rest          = parts.slice(1)
    } else if (datePattern.test(parts[0]) && parts.length >= 6) {
      // Single-day: parts[0] = date, parts[1] = "HH:MM-HH:MM"
      const timeMatch = timePattern.exec(parts[1])
      if (!timeMatch) continue
      arrivaldate   = toIsoDate(parts[0])
      departuredate = arrivaldate
      eta           = timeMatch[1]
      etd           = timeMatch[2]
      rest          = parts.slice(2)
    } else {
      continue // header row, page marker, or non-data line
    }

    if (rest.length < 5) continue

    arrivals.push({
      arrivaldate,
      departuredate,
      eta,
      etd,
      cruiseline:        rest[0],
      vesselname:        rest[1],
      vessellengthmetre: parseInt(rest[2]) || null,
      berth:             rest[3],
      visitors:          parseInt(rest[4].replace(/,/g, '')) || null,
    })
  }

  return arrivals
}

// -------------------------------------------------------
// Create the table (if it does not exist) and truncate it
// ready for a fresh import.
// -------------------------------------------------------
let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

const prepareBelfastScheduleTable = async () => {
  await getDb().run(`
    CREATE TABLE IF NOT EXISTS belfastharbour_cruise_schedule (
      id                SERIAL PRIMARY KEY,
      arrivaldate       DATE         NOT NULL,
      departuredate     DATE         NOT NULL,
      eta               TIME         NOT NULL,
      etd               TIME         NOT NULL,
      cruiseline        TEXT         NOT NULL,
      vesselname        TEXT         NOT NULL,
      vessellengthmetre INTEGER,
      berth             TEXT,
      visitors          INTEGER,
      pdfmoddate        TIMESTAMPTZ,
      importedat        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `)
  await getDb().run(
    `CREATE INDEX IF NOT EXISTS idx_bhcs_arrivaldate ON belfastharbour_cruise_schedule(arrivaldate)`
  )
  await getDb().run('TRUNCATE belfastharbour_cruise_schedule')
  console.log('belfastharbour_cruise_schedule table ready')
}

// -------------------------------------------------------
// Insert parsed rows into the table.
// -------------------------------------------------------
const saveArrivals = async (arrivals, pdfModDate) => {
  const sql = `
    INSERT INTO belfastharbour_cruise_schedule
      (arrivaldate, departuredate, eta, etd, cruiseline, vesselname,
       vessellengthmetre, berth, visitors, pdfmoddate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  for (const row of arrivals) {
    await getDb().run(sql, [
      row.arrivaldate, row.departuredate, row.eta, row.etd,
      row.cruiseline, row.vesselname, row.vessellengthmetre,
      row.berth, row.visitors, pdfModDate?.toISOString() ?? null,
    ])
  }
  console.log(`${arrivals.length} rows saved to belfastharbour_cruise_schedule`)
}

// -------------------------------------------------------
// Retrieve the ModDate of the last successful import.
// Returns a Date or null if the table is empty.
// No separate tracking table needed — pdfmoddate is stored on every row.
// -------------------------------------------------------
export const getLastPdfModDate = async () => {
  const row = await getDb().get(
    `SELECT MAX(pdfmoddate) AS lastmod FROM belfastharbour_cruise_schedule`
  )
  return row?.lastmod ? new Date(row.lastmod) : null
}

// -------------------------------------------------------
// Main export: discover the current PDF URL, check ModDate,
// and import only if the PDF has been updated.
//
// Returns { imported: boolean, modDate: Date, rowCount: number }
// -------------------------------------------------------
export const importBelfastScheduleFromPdf = async () => {
  const pdfUrl = await discoverPdfUrl()
  console.log('PDF URL:', pdfUrl)

  // Use the URL directly — PDFParse v2 public API does not accept a buffer
  const parser = new PDFParse({ url: pdfUrl })

  const infoResult = await parser.getInfo()
  const modDate = parsePdfDate(infoResult.info?.ModDate)
  console.log('PDF ModDate:', modDate)

  const lastKnownModDate = await getLastPdfModDate()
  if (lastKnownModDate && modDate <= lastKnownModDate) {
    console.log('Schedule unchanged — skipping import')
    return { imported: false, modDate, rowCount: 0 }
  }

  const textResult = await parser.getText()
  const arrivals = parseScheduleText(textResult.text)
  console.log(`Parsed ${arrivals.length} arrival rows`)

  await prepareBelfastScheduleTable()
  await saveArrivals(arrivals, modDate)

  return { imported: true, modDate, rowCount: arrivals.length }
}
```

## Backend integration

### New files to create

| File | Purpose |
|------|---------|
| `backend/belfastScheduleImport.js` | The module above |
| `backend/controllers/belfastScheduleController.js` | Express handlers for import + query routes |

### Changes to existing files

**`backend/routes/cruiseRouteCatalog.js`** — add two routes:

```js
import {
  importBelfastSchedule,
  getBelfastSchedule,
} from '../controllers/belfastScheduleController.js'

cruiseRouter.post('/importBelfastSchedule', importBelfastSchedule)
cruiseRouter.get('/getBelfastSchedule', getBelfastSchedule)
```

**`backend/controllers/belfastScheduleController.js`**:

```js
import {
  importBelfastScheduleFromPdf,
} from '../belfastScheduleImport.js'
import { DatabaseAdapter } from '../databaseUtilities.js'

let db = null
const getDb = () => { if (!db) db = new DatabaseAdapter(); return db }

export const importBelfastSchedule = async (_req, res) => {
  try {
    const result = await importBelfastScheduleFromPdf()
    res.json(result)
  } catch (err) {
    console.error('importBelfastSchedule error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export const getBelfastSchedule = async (req, res) => {
  try {
    const rows = await getDb().all(
      `SELECT * FROM belfastharbour_cruise_schedule
       WHERE arrivaldate >= CURRENT_DATE
       ORDER BY arrivaldate, eta`
    )
    res.json({ message: 'success', data: rows })
  } catch (err) {
    console.error('getBelfastSchedule error:', err.message)
    res.status(400).json({ error: err.message })
  }
}
```

### Frontend

Add an import button to `CruisesPage` using the same `fetchStatus` / `LinearProgress`
pattern already used for CruiseMapper data. The handler calls:

```
POST http://localhost:4000/api/cruise/importBelfastSchedule
```

The response returns `{ imported, modDate, rowCount }` directly (no polling needed —
the import is fast since it is a single HTTP fetch + text parse, not a Puppeteer scrape).
