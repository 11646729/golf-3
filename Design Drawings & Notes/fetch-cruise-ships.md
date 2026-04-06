# How Fetch Cruise Ships Works

## Flow Overview

### 1. Frontend Trigger — `frontend/src/functionHandlers/loadCruiseShipArrivalsDataHandler.js`

When triggered, the handler calls three backend API endpoints in sequence:

1. `POST /api/cruise/createPortArrivalsTable` — ensures the `portarrivals` DB table exists
2. `POST /api/cruise/createVesselsTable` — ensures the `vessels` DB table exists
3. `POST /api/cruise/importPortArrivalsAndVesselsData` — kicks off the actual scrape

The backend immediately responds `202 Accepted` on step 3 and runs the scrape in the background.

---

### 2. Backend Scraping — `backend/cruiseScrapingRoutines.js` → `importPortArrivalsAndVessels()`

**Step 1 — Get schedule months** (`getScheduleMonths`)
- Uses **Puppeteer** to open the CruiseMapper page for the configured port (e.g. Belfast)
- Scrapes the month/year dropdown (`#schedule ... option`) to find all periods with scheduled arrivals

**Step 2 — Get port arrivals per month** (`getAndSavePortArrivals`)
- Iterates over each `scheduledPeriod`
- Scrapes vessel arrivals for that month and saves them to the DB
- Returns a list of vessel detail URLs

**Step 3 — Scrape & save each vessel** (loop)
- Deduplicates the vessel URLs
- For each unique vessel URL: calls `scrapeVesselDetails()` then `saveVesselDetails()`
- Errors on individual vessels are caught and logged without stopping the loop

---

### 3. Data Source

The scrape targets **CruiseMapper** (URL from `CRUISE_MAPPER_URL` env var) for the port defined by `BELFAST_PORT_NAME` (currently hardcoded to Belfast in `cruiseScrapingRoutines.js:24`).

There is also a separate standalone script `backend/scrapeCruiseArrivals.js` that targets the Belfast Harbour booking site directly using Puppeteer — this appears to be an exploratory/debug script rather than part of the main flow.
