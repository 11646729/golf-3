import axios from "axios"

const DEFAULT_TIMEOUT = 20000 // 20s
const DEFAULT_HEADERS = { "Content-Type": "application/json" }

// -------------------------------------------------------
// Polls GET /api/cruise/getBelfastImportStatus every 2 seconds until the job
// reaches "complete" or "error". Returns { promise, cancel }.
// onUpdate(statusObject) is called on every successful poll response.
// -------------------------------------------------------
export const pollBelfastImportStatus = (onUpdate) => {
  let cancelled = false
  let timeoutId = null

  const promise = new Promise((resolve, reject) => {
    const poll = async () => {
      if (cancelled) return
      try {
        const response = await axios.get(
          "http://localhost:4000/api/cruise/getBelfastImportStatus",
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
// Function to trigger Belfast Harbour Cruise Schedule import.
// Responds immediately with 202; use pollBelfastImportStatus to wait for completion.
// -------------------------------------------------------
export const importBelfastScheduleHandler = async () => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }

  return await axios
    .post("http://localhost:4000/api/cruise/importBelfastSchedule", {}, config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("importBelfastScheduleHandler error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to fetch Belfast Harbour Cruise Schedule data
// -------------------------------------------------------
export const getBelfastScheduleData = async () => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }

  return await axios
    .get("http://localhost:4000/api/cruise/getBelfastSchedule", config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("getBelfastScheduleData error:", err?.message || err)
      throw err
    })
}

// -------------------------------------------------------
// Function to fetch current AIS vessel positions
// -------------------------------------------------------
export const getVesselPositionsData = async () => {
  const config = { timeout: DEFAULT_TIMEOUT, headers: DEFAULT_HEADERS }

  return await axios
    .get("http://localhost:4000/api/cruise/vesselPositions", config)
    .then((response) => response.data)
    .catch((err) => {
      console.error("getVesselPositionsData error:", err?.message || err)
      throw err
    })
}

// export { getPortArrivalsData as default }
