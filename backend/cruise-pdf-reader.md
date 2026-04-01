# Belfast Harbour Cruise Schedule PDF Reader

Downloads and reads the Belfast Harbour Cruise Schedule PDF using Puppeteer.

## Dependencies

```bash
npm install puppeteer
```

## Code

```js
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

const PDF_URL = 'https://www.belfast-harbour.co.uk/wp-content/uploads/2026/03/Belfast-Harbour-Cruise-Schedule-2026.pdf';
const OUTPUT_PATH = './cruise-schedule-2026.pdf';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Intercept the PDF response and save it
const response = await page.goto(PDF_URL, { waitUntil: 'networkidle2', timeout: 30000 });
const buffer = await response.buffer();
await writeFile(OUTPUT_PATH, buffer);

await browser.close();

console.log(`PDF saved to ${OUTPUT_PATH}`);
```

## Alternative: Direct download with node-fetch

```js
import { writeFile } from 'fs/promises';

const PDF_URL = 'https://www.belfast-harbour.co.uk/wp-content/uploads/2026/03/Belfast-Harbour-Cruise-Schedule-2026.pdf';
const OUTPUT_PATH = './cruise-schedule-2026.pdf';

const response = await fetch(PDF_URL);
if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

const buffer = Buffer.from(await response.arrayBuffer());
await writeFile(OUTPUT_PATH, buffer);

console.log(`PDF saved to ${OUTPUT_PATH} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
```

## Reading the PDF text with pdf-parse

```bash
npm install pdf-parse
```

```js
import { readFile } from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const buffer = await readFile('./cruise-schedule-2026.pdf');
const { text, numpages, info } = await pdfParse(buffer);

console.log(`Pages: ${numpages}`);
console.log(`Info:`, info);
console.log(`\n--- Text ---\n${text}`);
```

## Combined: Download and read in one script

```js
import { writeFile } from 'fs/promises';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const PDF_URL = 'https://www.belfast-harbour.co.uk/wp-content/uploads/2026/03/Belfast-Harbour-Cruise-Schedule-2026.pdf';

const response = await fetch(PDF_URL);
if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

const buffer = Buffer.from(await response.arrayBuffer());
await writeFile('./cruise-schedule-2026.pdf', buffer);
console.log(`PDF downloaded (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

const { text, numpages } = await pdfParse(buffer);
console.log(`Pages: ${numpages}`);
console.log(`\n--- Text ---\n${text}`);
```

## Run

```bash
node <script-name>.js
```
