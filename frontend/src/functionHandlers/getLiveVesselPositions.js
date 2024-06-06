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

  // Extract urls
  const urls = []
  let loop = 0
  do {
    urls.push(portArrivals[loop].vesselnameurl)

    loop += 1
  } while (loop < portArrivals.length)

  let resultData = []

  // Fetch the initial data - DO NOT CHANGE
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
  })

  return resultData.data
}
