import axios from "axios"

const DEFAULT_TIMEOUT = 20000
const DEFAULT_HEADERS = { "Content-Type": "application/json" }

// -------------------------------------------------------
// Function to prepare the golfcourses table in the SQL database
// -------------------------------------------------------
const prepareGolfCoursesTable = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return await axios
    .post(url, {}, config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("prepareGolfCoursesTable error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to instruct backend to load Golf Club Data into the database
// -------------------------------------------------------
const initialImportOfGolfCoursesData = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return await axios
    .post(url, {}, config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("initialImportOfGolfCoursesData error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to fetch all Golf Courses data into the SQL database
// Used by GolfCoursesPage when the "Update Database" button is clicked
// -------------------------------------------------------
export const loadGolfCoursesDataHandler = async () => {
  try {
    await prepareGolfCoursesTable(
      "http://localhost:4000/api/golf/createGolfCoursesTable",
    )
    await initialImportOfGolfCoursesData(
      "http://localhost:4000/api/golf/importGolfCoursesData",
    )
  } catch (err) {
    console.error("loadGolfCoursesDataHandler failed:", err?.message || err)
    throw err
  }
}

// -------------------------------------------------------
// Fetches the last import timestamp from the backend
// -------------------------------------------------------
export const getGolfImportStatus = async () => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return await axios
    .get("http://localhost:4000/api/golf/importStatus", config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("getGolfImportStatus error:", err?.message || err)
      return { lastUpdated: null }
    })
}

// -------------------------------------------------------
// Function to fetch all Golf Course data for display
// -------------------------------------------------------
export const getGolfCoursesData = async (url) => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }
  return await axios
    .get(url, config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("getGolfCoursesData error:", err?.message || err)
      throw err
    })
}

export { getGolfCoursesData as default }
