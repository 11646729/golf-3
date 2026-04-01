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
