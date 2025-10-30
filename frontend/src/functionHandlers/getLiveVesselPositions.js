import axios from "axios"

// -------------------------------------------------------
// Function to fetch Live Vessel Positions
// -------------------------------------------------------
export const getLiveVesselPositions = async (portArrivals) => {
  // Guard clause
  if (portArrivals == null) {
    console.log(
      "Error: portArrivals == null in getVesselPositions in utilities.js"
    )
    return
  }

  // Guard clause for empty array
  if (portArrivals.length === 0) {
    console.log("Error: portArrivals is empty in getVesselPositions")
    return []
  }

  // Extract urls
  const urls = []
  let loop = 0
  do {
    if (portArrivals[loop] && portArrivals[loop].vesselnameurl) {
      urls.push(portArrivals[loop].vesselnameurl)
    } else {
      console.warn(`Port arrival at index ${loop} is missing vesselnameurl`)
    }

    loop += 1
  } while (loop < portArrivals.length)

  let resultData = []

  // Guard clause for empty URLs array
  if (urls.length === 0) {
    console.log("Error: No valid URLs found in portArrivals data")
    return []
  }

  // Fetch the initial data - DO NOT CHANGE
  try {
    resultData = await axios({
      url: "http://localhost:4000/api/cruise/vesselPositions",
      params: {
        portArrivals: urls,
      },
      method: "GET",
      timeout: 8000,
      headers: {
        "Content-Type": "application/json",
      },
      paramsSerializer: {
        indexes: null, // This ensures arrays are sent as portArrivals[]=url1&portArrivals[]=url2
      },
    })
  } catch (error) {
    console.error("Error in getLiveVesselPositions axios call:", error)
    console.error("URLs being sent:", urls)
    throw error
  }

  return resultData.data
}
