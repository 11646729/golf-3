# Migration: Cheerio → Puppeteer

## Overview

Replaced `axios` + `cheerio` with `puppeteer` across all scraping files. Puppeteer uses a real headless Chrome browser, which handles JavaScript-rendered pages that cheerio (static HTML parser) cannot.

## Files Changed

### New File: `puppeteerBrowser.js`

Created a shared browser singleton to avoid launching multiple browser instances on every scraping call.

```js
import puppeteer from 'puppeteer'

let _browser = null

export const getBrowser = async () => {
  if (!_browser || !_browser.connected) {
    _browser = await puppeteer.launch({ headless: true })
  }
  return _browser
}

export const closeBrowser = async () => {
  if (_browser) {
    await _browser.close()
    _browser = null
  }
}
```

---

### `cruiseScrapingRoutines.js`

**Removed:**
```js
import * as cheerio from "cheerio"
```

**Added:**
```js
import { getBrowser } from "./puppeteerBrowser.js"
```

**`getScheduleMonths` — Before (fetch + cheerio):**
```js
const response = await fetch(initialUrl)
const data = await response.text()

const $ = cheerio.load(data)

$("#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option").each(
  (i, item) => {
    const monthYearString = $(item).attr("value")
    scheduledPeriods.push({ monthYearString })
  }
)
```

**After (Puppeteer):**
```js
const browser = await getBrowser()
const page = await browser.newPage()

try {
  await page.goto(initialUrl, { waitUntil: "networkidle2", timeout: 30000 })

  const scheduledPeriods = await page.$$eval(
    "#schedule > div:nth-child(2) > div.col-xs-8.thisMonth option",
    (options) => options.map((opt) => ({ monthYearString: opt.value }))
  )

  return scheduledPeriods
} finally {
  await page.close()
}
```

---

### `controllers/portArrivalsController.js`

**Removed:**
```js
import axios from "axios"
import * as cheerio from "cheerio"
```

**Added:**
```js
import { getBrowser } from "../puppeteerBrowser.js"
```

**`getSingleMonthPortArrival` — Before (axios + cheerio):**
```js
const resp = await axios.get(arrivalUrl)
const html = resp.data

const $ = cheerio.load(html)

const rows = $(".portItemSchedule tr").toArray()

for (let i = 1; i < rows.length; i++) {
  const item = rows[i]
  const vessel_short_cruise_name = $(item).find("a").text()
  let arrivalDate = $(item).children("td").children("span").html().replace(/,/, "")
  let vessel_eta_time = $(item).children("td").next("td").next("td").html()
  let vessel_etd_time = $(item).children("td").last("td").html()
  const cruise_line_logo_url = $(item).find("img").attr("src")
  const raw_cruise_line = $(item).find("img").attr("title")
  const vessel_name_url = $(item).find("a").attr("href")
  // ...save to DB
}
```

**After (Puppeteer):**
```js
const browser = await getBrowser()
const page = await browser.newPage()

try {
  await page.goto(arrivalUrl, { waitUntil: "networkidle2", timeout: 30000 })

  rows = await page.evaluate(() => {
    const trs = Array.from(
      document.querySelectorAll(".portItemSchedule tr")
    ).slice(1) // skip header row

    return trs.map((tr) => {
      const tds = Array.from(tr.querySelectorAll("td"))
      const anchor = tr.querySelector("a")
      const img = tr.querySelector("img")
      const span = tds[0]?.querySelector("span")

      return {
        vessel_short_cruise_name: anchor?.textContent?.trim() ?? "",
        arrivalDate: span?.innerHTML?.replace(/,/, "") ?? "",
        vessel_eta_time: tds[2]?.innerHTML?.trim() ?? "",
        vessel_etd_time: tds[tds.length - 1]?.innerHTML?.trim() ?? "",
        cruise_line_logo_url: img?.getAttribute("src") ?? "",
        raw_cruise_line: img?.getAttribute("title") ?? "",
        vessel_name_url: anchor?.getAttribute("href") ?? "",
      }
    })
  })
} finally {
  await page.close()
}

// Process rows with same business logic as before
for (const item of rows) { ... }
```

**Key change:** All DOM data is extracted in a single `page.evaluate()` call, then the date/time parsing and DB save logic runs in Node as before. The `do...while` loop over rows was replaced with `for...of` for clarity.

---

### `controllers/vesselController.js`

**Removed:**
```js
import axios from "axios"
import * as cheerio from "cheerio"
```

**Added:**
```js
import { getBrowser } from "../puppeteerBrowser.js"
```

#### `scrapeVesselDetails` — Before (axios + cheerio):
```js
const { data: html } = await axios.get(vessel_url)
const $ = cheerio.load(html)

let vessel_title = $("#container > main > section > article > header > h1").text().trim()

const link1 = $(
  "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a"
).get(0)
let vessel_photo_title = link1.attribs.title
let vessel_photourl = "https://www.cruisemapper.com" + link1.attribs.href

let vessel_flag = $("td")
  .filter(function () { return $(this).text().trim() === "Flag state" })
  .next().text().trim()
// ...repeated for each vessel property
```

**After (Puppeteer):**
```js
const browser = await getBrowser()
const page = await browser.newPage()

try {
  await page.goto(vessel_url, { waitUntil: "networkidle2", timeout: 30000 })

  const data = await page.evaluate(() => {
    // Helper to find a <td> by label and return its next sibling's text
    const getTdNext = (label) => {
      const td = Array.from(document.querySelectorAll("td")).find(
        (t) => t.textContent.trim() === label
      )
      return td?.nextElementSibling?.textContent?.trim() ?? ""
    }

    const vessel_title =
      document.querySelector(
        "#container > main > section > article > header > h1"
      )?.textContent?.trim() ?? ""

    const coverLink = document.querySelector(
      "#container > main > section > article > section > div.row.coverItem > div:nth-child(1) > a"
    )

    return {
      vessel_title,
      vessel_photo_title: coverLink?.getAttribute("title") ?? "",
      vessel_photourl_path: coverLink?.getAttribute("href") ?? "",
      vessel_flag: getTdNext("Flag state"),
      vessel_long_operator: getTdNext("Operator"),
      vessel_year_built_temp: getTdNext("Year built"),
      vessel_length_metres_temp: getTdNext("Length (LOA)"),
      vessel_width_metres_temp: getTdNext("Beam (width)"),
      vessel_gross_tonnage_temp: getTdNext("Gross Tonnage"),
      vessel_max_speed_knots_temp: getTdNext("Speed"),
      vessel_typical_passengers: getTdNext("Passengers"),
      vessel_typical_crew_raw: getTdNext("Crew"),
    }
  })
  // Apply same transformations as before (string parsing, parseInt, etc.)
} finally {
  await page.close()
}
```

**Key change:** The repeated `$("td").filter(fn).next().text()` pattern was replaced by a single `getTdNext(label)` helper inside `page.evaluate()`. The `attribs.title` / `attribs.href` cheerio properties became `getAttribute("title")` / `getAttribute("href")` standard DOM calls.

#### `getVesselPosition` — Before (axios + cheerio):
```js
const { data: html } = await axios.get(arrivals[j], {
  timeout: 10000,
  headers: { "User-Agent": "Mozilla/5.0 ..." },
})
const $ = cheerio.load(html)

let positionParagraph = $(
  "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p"
).text().trim()
```

**After (Puppeteer):**
```js
const browser = await getBrowser()
const page = await browser.newPage()
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

try {
  for (let j = 0; j < arrivals.length; j++) {
    await page.goto(arrivals[j], { waitUntil: "networkidle2", timeout: 10000 })

    const positionParagraph = await page
      .$eval(
        "#container > main > section > article > section > div:nth-child(3) > div > div.col-md-4.currentItineraryInfo > p",
        (el) => el.textContent.trim()
      )
      .catch(() => "")
    // ...same parsing logic as before
  }
} finally {
  await page.close()
}
```

**Key change:** A single page is created before the loop and reused across all vessel URLs (more efficient than opening/closing a page per URL). `axios` timeout + User-Agent headers were replaced with `page.setUserAgent()` and Puppeteer's built-in `timeout` option. The `.catch(() => "")` handles missing elements gracefully without throwing.

---

## Cheerio → Puppeteer API Mapping

| Cheerio | Puppeteer equivalent |
|---|---|
| `fetch(url)` + `cheerio.load(html)` | `page.goto(url)` |
| `$(selector).text()` | `page.$eval(selector, el => el.textContent.trim())` |
| `$(selector).attr("href")` | `page.$eval(selector, el => el.getAttribute("href"))` |
| `$(selector).html()` | `page.$eval(selector, el => el.innerHTML)` |
| `$("td").filter(fn).next().text()` | `getTdNext(label)` inside `page.evaluate()` |
| `$(selector).each(fn)` | `page.$$eval(selector, els => els.map(fn))` |
| `.get(0).attribs.title` | `.getAttribute("title")` inside `page.evaluate()` |

## Dependencies

```bash
npm install puppeteer     # replaces axios + cheerio for scraping
```

`axios` and `cheerio` can be removed from `package.json` if not used elsewhere.
