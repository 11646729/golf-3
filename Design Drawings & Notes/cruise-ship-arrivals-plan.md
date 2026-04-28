# Cruise Ship Arrivals — Architecture & Plan

## Overview

The Cruise Ship Arrivals feature scrapes port arrival schedules and vessel details from CruiseMapper, stores them in PostgreSQL, and displays them on a table + live map. Because the scrape can take several minutes, the backend starts the job in the background and returns HTTP 202 immediately; the frontend polls a status endpoint every 2 seconds to track progress.

---

## Data Flow

```
User clicks "Update Database"
  │
  ▼
CruisesPage.handleFetchData()
  │  calls loadCruiseShipArrivalsDataHandler (3 sequential HTTP POSTs)
  │
  ├─ POST /api/cruise/createPortArrivalsTable   → truncates/creates port_arrivals table
  ├─ POST /api/cruise/createVesselsTable        → truncates/creates vessels table
  └─ POST /api/cruise/importPortArrivalsAndVesselsData
         │  responds HTTP 202 immediately
         │  background job runs 3 phases:
         │    1. fetching_schedule  — Puppeteer: get available months from CruiseMapper
         │    2. scraping_arrivals  — Puppeteer: scrape each month's arrival list, save rows
         │    3. scraping_vessels   — Puppeteer: scrape each unique vessel page, save details
         │
         ▼
  pollImportStatus() polls GET /api/cruise/importStatus every 2 s
         │  updates jobProgress state → CruisesImportButton shows phase label + progress bar
         └─ resolves when status === "complete", rejects on "error"
```

---

## Frontend Components

### `CruisesPage.jsx`
- State: `portArrivals`, `vesselPositions`, `isLoading`, `fetchStatus`, `jobProgress`
- `pollingCancelRef` — cancels polling on unmount to avoid memory leaks
- On mount: fetches port arrivals from DB, then fetches live vessel positions
- `handleFetchData` — orchestrates the 3-step import + polling

### `CruisesImportButton.jsx`
- Props: `fetchStatus`, `jobProgress`, `lastPositionDate`, `onFetch`
- Shows indeterminate `LinearProgress` for phases `fetching_schedule` and `scraping_arrivals`
- Shows determinate `LinearProgress` (0–100%) during `scraping_vessels` phase based on `jobProgress.vesselsScraped / jobProgress.totalVessels`
- Button disabled while loading or if data was already imported today
- Displays "Last date updated: DD/MM/YYYY" from the most recent vessel timestamp

### `CruisesTable.jsx`
- Displays port arrivals (vessel name, ETA, ETD, port, berth, etc.)

### `CruisesMap.jsx`
- Plots live vessel positions using Google Maps
- Markers driven by `vesselPositions` array fetched from `getLiveVesselPositions`

---

## Backend API Routes (`/api/cruise/...`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/createPortArrivalsTable` | CREATE TABLE IF NOT EXISTS + TRUNCATE port_arrivals |
| POST | `/createVesselsTable` | CREATE TABLE IF NOT EXISTS + TRUNCATE vessels |
| POST | `/importPortArrivalsAndVesselsData` | Starts background scrape job, returns 202 immediately |
| GET | `/importStatus` | Returns current in-memory job status object |
| GET | `/getPortArrivals` | Returns all port arrivals for configured port name |
| GET | `/vesselPositions` | Returns all vessel positions |
| POST | `/portArrivals` | Save a single port arrival (internal) |

---

## Backend Scraping Pipeline (`cruiseScrapingRoutines.js`)

### In-Memory Status Object
```js
{
  status: "idle" | "running" | "complete" | "error",
  phase: "fetching_schedule" | "scraping_arrivals" | "scraping_vessels" | "done",
  arrivalsAdded: number,
  totalVessels: number,
  vesselsScraped: number,
  error: string | null
}
```

### Phase 1 — `fetching_schedule`
- Opens Puppeteer page to CruiseMapper port URL for current month
- Scrapes the `<select>` dropdown of available month/year options
- Returns array of `{ monthYearString }` objects

### Phase 2 — `scraping_arrivals`
- Calls `getAndSavePortArrivals(scheduledPeriods, port, portName)` from `portArrivalsController.js`
- Iterates each month, scrapes vessel arrival rows, saves to `port_arrivals` table
- Returns array of vessel detail URLs (one per arrival)

### Phase 3 — `scraping_vessels`
- De-duplicates vessel URLs (same ship can appear multiple times)
- Loops through each unique vessel URL, calls `scrapeVesselDetails(url)`
- Per-vessel scrape failures are caught and logged individually (non-fatal)
- Saves each vessel's details via `saveVesselDetails(scrapedVessel)`
- Updates `vesselsScraped` counter on each iteration for frontend progress bar

### Error Handling
- Fatal errors (e.g. browser crash) caught at top level → sets `status: "error"`
- Per-vessel scrape failures are skipped with a `console.warn` — import continues
- Frontend polls until `status === "complete"` or `status === "error"`

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `VITE_PORT_NAME` | Port name sent to backend for filtering arrivals |
| `BELFAST_PORT_NAME` | Used by backend to look up port URL env var |
| `<PORT>_PORT_URL` | CruiseMapper URL path for the configured port |
| `CRUISE_MAPPER_URL` | Base URL for CruiseMapper (e.g. `https://www.cruisemapper.com/ports/`) |

---

## Known Issues / Gaps

1. **No transaction wrapping** — `createPortArrivalsTable` and `createVesselsTable` are called as separate HTTP requests. If `createVesselsTable` fails after `createPortArrivalsTable` has already truncated, the arrivals table is empty with no rollback path. Consider combining into a single transactional setup endpoint.

2. **`lastPositionDate` derived from vessel timestamps** — the "last updated" date shown in `CruisesImportButton` is the most recent vessel `timestamp` from the live positions feed, not a stored import timestamp. This means it may show stale or missing dates if vessel positions aren't available.

3. **Live vessel positions are re-fetched on every page load** — `getLiveVesselPositions` calls an external AIS feed each time, which could be slow or rate-limited. No caching currently.

4. **Polling continues even if user navigates away mid-import** — the `pollingCancelRef` cancels on component unmount, but if the user navigates back, there is no way to re-attach to an in-progress job.

5. **Single in-memory status** — if the server restarts mid-import, `importStatus` is reset to `idle` and the frontend will resolve the poll as complete prematurely.

---

## Potential Improvements

- Store import run metadata (start time, end time, records imported) in a `cruise_import_log` table, similar to the GTFS analytics tables.
- Derive `lastPositionDate` from `cruise_import_log` rather than live vessel timestamps.
- Add a single `/setupCruiseTables` endpoint that wraps both table setups in a transaction.
- Add re-attach logic: if the frontend loads and `importStatus.status === "running"`, automatically start polling without needing a button press.
- Consider rate-limiting / retry logic around Puppeteer page loads for vessel detail pages.
