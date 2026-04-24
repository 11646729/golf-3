import axios from "axios"

const DEFAULT_TIMEOUT = 20000
const DEFAULT_HEADERS = { "Content-Type": "application/json" }

// -------------------------------------------------------
// Fetches the last import timestamp from the backend
// -------------------------------------------------------
export const getCrimesImportStatus = async () => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return await axios
    .get("http://localhost:4000/api/crimes/importStatus", config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("getCrimesImportStatus error:", err?.message || err)
      return { lastUpdated: null }
    })
}

// -------------------------------------------------------
// Function to prepare the crimes table in the SQL database
// -------------------------------------------------------
const prepareCrimesTable = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .post(url, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to instruct backend to load Crimes Data into the database
// -------------------------------------------------------
const initialImportOfCrimesData = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .post(url, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Crimes data
// -------------------------------------------------------
export const getCrimesData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Crimes data into the SQL database
// -------------------------------------------------------
export const loadCrimesDataHandler = async () => {
  try {
    await prepareCrimesTable("http://localhost:4000/api/crimes/createCrimesTable")
    await initialImportOfCrimesData("http://localhost:4000/api/crimes/importCrimesData")
  } catch (err) {
    console.error("loadCrimesDataHandler failed:", err?.message || err)
    throw err
  }
}

export { getCrimesData as default }
