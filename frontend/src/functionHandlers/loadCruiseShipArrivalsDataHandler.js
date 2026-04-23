import axios from "axios"

const DEFAULT_TIMEOUT = 20000 // 20s
const DEFAULT_HEADERS = { "Content-Type": "application/json" }

// -------------------------------------------------------
// Function to prepare the portarrivals table in the SQL database
// -------------------------------------------------------
const preparePortArrivalsTable = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }

  return await axios
    .post(url, {}, config)
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

  return await axios
    .post(url, {}, config)
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

  return await axios
    .post(url, params, config)
    .then((returnedData) => returnedData.data)
    .catch((err) => {
      console.error(
        "importPortArrivalsAndVesselsData error:",
        err?.message || err,
      )
      throw err
    })
}

// -------------------------------------------------------
// Function to store all Cruise PortArrivals & Vessel data in the SQL database
// Used by RawDataTable.jsx when the "Load Cruise Ship Arrivals Data" button is clicked
// -------------------------------------------------------
export const loadCruiseShipArrivalsDataHandler = async () => {
  try {
    await preparePortArrivalsTable(
      "http://localhost:4000/api/cruise/createPortArrivalsTable",
    )

    await prepareVesselsTable(
      "http://localhost:4000/api/cruise/createVesselsTable",
    )

    await importPortArrivalsAndVesselsData(
      "http://localhost:4000/api/cruise/importPortArrivalsAndVesselsData",
    )
  } catch (err) {
    console.error(
      "loadCruiseShipArrivalsDataHandler failed:",
      err?.message || err,
    )
    throw err
  }
}

// -------------------------------------------------------
// Polls GET /api/cruise/importStatus every 2 seconds until the job
// reaches "complete" or "error". Returns { promise, cancel } so callers
// can abort polling on unmount.
// onUpdate(statusObject) is called on every successful poll response.
// -------------------------------------------------------
export const pollImportStatus = (onUpdate) => {
  let cancelled = false
  let timeoutId = null

  const promise = new Promise((resolve, reject) => {
    const poll = async () => {
      if (cancelled) return
      try {
        const response = await axios.get(
          "http://localhost:4000/api/cruise/importStatus",
          { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS },
        )
        const data = response.data
        if (!cancelled) onUpdate(data)

        if (data.status === "complete") {
          resolve(data)
        } else if (data.status === "error") {
          reject(new Error(data.error || "Import failed"))
        } else {
          if (!cancelled) timeoutId = setTimeout(poll, 2000)
        }
      } catch (err) {
        if (!cancelled) reject(err)
      }
    }
    poll()
  })

  const cancel = () => {
    cancelled = true
    if (timeoutId) clearTimeout(timeoutId)
  }

  return { promise, cancel }
}

// -------------------------------------------------------
// Function to fetch all Cruise Vessel data
// Used by CruiseShipArrivalsDataTable.jsx to display the data in a table
// -------------------------------------------------------
export const getPortArrivalsData = async (url) => {
  const params = { portName: import.meta.env.VITE_PORT_NAME }
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS, params }

  return await axios
    .get(url, config)
    .then((returnedData) => returnedData.data)
    .catch((err) => {
      console.error("getPortArrivalsData error:", err?.message || err)
      throw err
    })
}

export { getPortArrivalsData as default }
