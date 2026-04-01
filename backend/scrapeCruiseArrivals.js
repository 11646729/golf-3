import puppeteer from 'puppeteer';

const URL = 'https://booking.belfast-harbour.co.uk';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Capture any XHR/fetch responses that may contain cruise data
const apiResponses = [];
page.on('response', async (response) => {
  const url = response.url();
  const contentType = response.headers()['content-type'] || '';
  if (contentType.includes('application/json') || url.includes('GBBEL-WEB-0004')) {
    try {
      const text = await response.text();
      apiResponses.push({ url, body: text });
    } catch (_) {}
  }
});

console.log(`Navigating to ${URL} ...`);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

// Click the Cruise Ships menu item if present
try {
  await page.evaluate(() => {
    const links = [...document.querySelectorAll('a, button, li, div')];
    const cruiseLink = links.find(el => el.textContent.trim() === 'Cruise Ships');
    if (cruiseLink) cruiseLink.click();
  });
  // Wait for dynamic content to load
  await new Promise(r => setTimeout(r, 4000));
} catch (e) {
  console.warn('Could not click Cruise Ships menu:', e.message);
}

// Try to extract table data from the page
const tableData = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('table tr')];
  return rows.map(row => {
    const cells = [...row.querySelectorAll('th, td')].map(cell => cell.innerText.trim());
    return cells;
  }).filter(row => row.length > 0);
});

await browser.close();

if (tableData.length > 0) {
  console.log('\n--- Cruise Ship Arrivals ---');
  tableData.forEach(row => console.log(row.join(' | ')));
} else {
  console.log('\nNo table data found on page.');
}

if (apiResponses.length > 0) {
  console.log('\n--- API Responses Captured ---');
  apiResponses.forEach(({ url, body }) => {
    console.log(`\nURL: ${url}`);
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      console.log(body.slice(0, 2000));
    }
  });
}
