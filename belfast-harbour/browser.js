import puppeteer from "puppeteer"

const startBrowser = async () => {
  let browser
  try {
    console.log("Opening the browser......")
    browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
      ignoreHTTPSErrors: true,
    })
  } catch (err) {
    console.log("Could not create a browser instance => : ", err)
  }
  return browser
}

export default startBrowser
