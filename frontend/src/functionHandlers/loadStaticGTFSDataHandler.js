import axios from "axios"

// -------------------------------------------------------
// Function to fetch Static GTFS data into the SQL database
// -------------------------------------------------------
export const loadStaticGTFSDataHandler = async () => {
  // This function prepares an empty database & imports Static GTFS Data into local SQL database
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  await axios
    .post("http://localhost:4000/api/gtfs/importStaticGTFSData", params, config)
    .then(() => alert("Static GTFS data has been Imported to SQL database"))
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch Transport Agency
// -------------------------------------------------------
export const getAllAgenciesFrontEnd = async (url) => {
  // Guard clauses
  if (url == null) return

  // Ok to headers
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  const responseData = await axios.get(url, params, config)

  return responseData.data.map(function (row) {
    return { agencyid: row.agency_id, label: row.agency_name }
  })

  // ------------------
  // ORIGINAL CODE
  // ------------------
  // return await axios
  //   .get(url, params, config)
  //   .then((response) => response.data)
  //   .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch Routes for a Single Agency data
// -------------------------------------------------------
export const getRoutesForSingleAgencyFrontEnd = async (
  url,
  transportAgencyId
) => {
  // Guard clauses
  if (url == null) return
  if (transportAgencyId == null) return

  // Ok to headers
  const params = { agency_id: transportAgencyId }
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  const responseData = await axios.get(url, params, config)

  return responseData.data.map(function (row) {
    return {
      agencyid: row.agency_id,
      routeid: row.route_id,
      label: row.route_short_name,
      // label: row.route_long_name,
    }
  })

  // ------------------
  // ORIGINAL CODE
  // ------------------
  // return await axios
  //   .get(url, params, config)
  //   .then((response) => response.data)
  //   .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Shapes for a single Route
// -------------------------------------------------------
export const getShapesForSingleRouteFrontEnd = async (
  url,
  transportRouteId,
  transportRoutesArray
) => {
  // Guard clauses
  if (url == null) return
  if (transportRouteId == null) return
  if (transportRoutesArray.length === 0) return

  // Ok to headers
  // const params = { route_id: transportRouteId }
  // const config = {
  //   timeout: 20000,
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // }

  // return await axios
  //   .get(url, params, config)
  //   .then((response) => response.data)
  //   .catch((err) => console.log(err))

  const resultData = await axios({
    url: url,
    method: "GET",
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      route_id: transportRouteId,
    },
  })

  // Now extract all unique shape_id and sort into ascending order
  const uniqueShapeIds = getShapeIDs(resultData.data)

  // Now reformat busShapes into a new array
  const reformattedShapes = reformatShapesData(uniqueShapeIds, resultData.data)

  return reformattedShapes
}

// -------------------------------------------------------
// Function to fetch all shape_ids
// -------------------------------------------------------
const getShapeIDs = (busShapesArray) => {
  // Now extract all unique shape_ids
  const uniqueShapeIds = [
    ...new Set(busShapesArray.map((item) => item.shape_id)),
  ]

  // And sort into ascending order
  uniqueShapeIds.sort((a, b) => parseFloat(a.shape_id) - parseFloat(b.shape_id))

  return uniqueShapeIds
}

// -------------------------------------------------------
// Function to reformat coordinates into a new array
// -------------------------------------------------------
const reformatShapesData = (uniqueShapeIDs, busShapesArray) => {
  const modifiedShapeArray = []

  for (let k = 0; k < uniqueShapeIDs.length; k += 1) {
    const tempArray = []
    const finalArray = []

    // Select all busShape objects with the same shape_id & store in tempArray
    for (let i = 0; i < busShapesArray.length; i += 1) {
      if (busShapesArray[i].shape_id === uniqueShapeIDs[k]) {
        tempArray.push(busShapesArray[i])
      }
    }

    // Sort shaped_id by ascending shape_pt_sequence
    if (tempArray.length > 0) {
      tempArray.sort(
        (a, b) =>
          parseFloat(a.shape_pt_sequence) - parseFloat(b.shape_pt_sequence)
      )

      // Iterate over shape_pt_sequence & store all lat & lng values in an object
      let j = 0
      do {
        const coords = {
          lat: tempArray[j].shape_pt_lat,
          lng: tempArray[j].shape_pt_lon,
        }

        finalArray.push(coords)

        j += 1
      } while (j < tempArray.length)

      // const colors = [
      //   "#C2272D",
      //   "#F8931F",
      //   "#FFFF01",
      //   "#009245",
      //   "#0193D9",
      //   "#0C04ED",
      //   "#612F90",
      // ]
      // for (var i = 0; i < colors.length; i++) {
      //   listItems[i].style.color = colors[i]
      // }

      // Add other relevant values into the object
      const modifiedShape = {
        shapeKey: uniqueShapeIDs[k],
        shapeCoordinates: finalArray,
        display: "yes",
        defaultColor: "#C2272D",
      }

      // Store the object in modifiedShapeArray
      modifiedShapeArray.push(modifiedShape)
    }
  }

  return modifiedShapeArray
}

// -------------------------------------------------------
// Function to fetch Unique Gtfs Stops data
// -------------------------------------------------------
export const getStopsForSingleRouteFrontEnd = async (
  url,
  transportRouteId,
  transportRoutesArray
) => {
  // Guard clauses
  if (url == null) return
  if (transportRouteId == null) return
  if (transportRoutesArray.length === 0) return

  // Ok to headers
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  // ------------------
  // ORIGINAL CODE
  // ------------------
  return await axios
    .get(url, params, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}
