import axios from "axios"

const DEFAULT_TIMEOUT = 3000 // 3s

const DEFAULT_HEADERS = { "Content-Type": "application/json" }

async function requestWithRetry(fn, attempts = 3, delayMs = 500) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      // simple backoff
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)))
    }
  }
  throw lastError
}

// -------------------------------------------------------
// Function to prepare the portarrivals table in the SQL database
// -------------------------------------------------------
const preparePortArrivalsTable = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return requestWithRetry(() => axios.post(url, {}, config))
    .then((response) => response.data)
    .catch((err) => {
      console.error("preparePortArrivalsTable error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to prepare the vessels table in the SQL database
// -------------------------------------------------------
const prepareVesselsTable = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return requestWithRetry(() => axios.post(url, {}, config))
    .then((response) => response.data)
    .catch((err) => {
      console.error("prepareVesselsTable error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to fetch all Cruise PortArrivals & Vessel data
// -------------------------------------------------------
const importPortArrivalsAndVesselsData = async (url) => {
  const params = { portName: import.meta.env.VITE_PORT_NAME }
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }

  return requestWithRetry(() => axios.post(url, params, config))
    .then((returnedData) => returnedData.data)
    .catch((err) => {
      console.error(
        "importPortArrivalsAndVesselsData error:",
        err?.message || err
      )
      throw err
    })
}

// -------------------------------------------------------
// Function to fetch all Cruise Vessel data
// -------------------------------------------------------
export const getPortArrivalsData = async (url) => {
  const params = { portName: import.meta.env.VITE_PORT_NAME }
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS, params }

  console.log("Fetching Cruise Port Arrivals data...", url)

  return requestWithRetry(() => axios.get(url, config))
    .then((returnedData) => returnedData.data)
    .catch((err) => {
      console.error("getPortArrivalsData error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to store all Cruise PortArrivals & Vessel data in the SQL database
// -------------------------------------------------------
export const loadCruiseShipArrivalsDataHandler = async () => {
  try {
    await preparePortArrivalsTable(
      "http://localhost:4000/api/cruise/preparePortArrivalsTable"
    )
    await prepareVesselsTable(
      "http://localhost:4000/api/cruise/prepareVesselsTable"
    )
    await importPortArrivalsAndVesselsData(
      "http://localhost:4000/api/cruise/importPortArrivalsAndVesselsData"
    )
    console.log("Cruise data import completed")
  } catch (err) {
    console.error(
      "loadCruiseShipArrivalsDataHandler failed:",
      err?.message || err
    )
    throw err
  }
}

export { getPortArrivalsData as default }
