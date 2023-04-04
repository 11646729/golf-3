import axios from "axios"

// -------------------------------------------------------
// Function to import the GTFS data into the SQL database
// -------------------------------------------------------
const importGTFSBusData = async () => {
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  await axios
    .post("http://localhost:4000/api/bus/importGTFSBusData", params, config)
    //    .then((returnedData) => console.log(returnedData))
    .then(() => alert("Import now successful"))
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all shape_ids
// -------------------------------------------------------
const getShapeIDs = (busShapesCollection) => {
  // Now extract all unique shape_ids
  const uniqueShapeIds = [
    ...new Set(busShapesCollection.map((item) => item.shape_id)),
  ]

  // And sort into ascending order
  uniqueShapeIds.sort((a, b) => parseFloat(a.shape_id) - parseFloat(b.shape_id))

  return uniqueShapeIds
}

// -------------------------------------------------------
// Function to fetch Position data for a Specific Route
// -------------------------------------------------------
export const selectedUniqueRoute = async (
  url,
  selectedBusRouteNumber,
  selected
) => {
  // Guard clause
  if (url == null) return
  const resultData = await axios({
    url: { url },
    data: {
      routeNumber: selectedBusRouteNumber,
      routeVisible: selected,
    },
    method: "PUT",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })
  return resultData.data
}

// -------------------------------------------------------
// Function to fetch Bus Agency
// -------------------------------------------------------
export const getAgencyName = async () => {
  const resultData = await axios({
    url: "http://localhost:4000/api/bus/agencyname/",
    method: "GET",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // console.log(resultData.data)

  return resultData.data
}

// -------------------------------------------------------
// Function to fetch Shapes data for a specific shapeID
// -------------------------------------------------------
export const getShape = async (url, shapeID) => {
  // Guard clauses
  if (url == null) return
  if (shapeID == null) return

  const resultData = await axios({
    url: { url },
    params: {
      shape: shapeID,
    },
    method: "GET",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  return resultData.data
}

// -------------------------------------------------------
// Function to reformat coordinates into a new array
// -------------------------------------------------------
const reformatShapesData = (uniqueShapeIDs, busShapesCollection) => {
  const modifiedShapeArray = []

  for (let k = 0; k < uniqueShapeIDs.length; k += 1) {
    const tempArray = []
    const finalArray = []

    // Select all busShape objects with the same shape_id & store in tempArray
    for (let i = 0; i < busShapesCollection.length; i += 1) {
      if (busShapesCollection[i].shape_id === uniqueShapeIDs[k]) {
        tempArray.push(busShapesCollection[i])
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
export const getAllStops = async () => {
  const resultData = await axios({
    url: "http://localhost:4000/api/bus/stops/",
    method: "GET",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  return resultData.data
}

// -------------------------------------------------------
// Function to fetch Unique Gtfs Routes data
// -------------------------------------------------------
export const getAllRoutes = async () => {
  const resultData = await axios({
    url: "http://localhost:4000/api/bus/routes/",
    method: "GET",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  return resultData.data
}

// -------------------------------------------------------
// Function to remove Gtfs data fields routeVisible === false
// -------------------------------------------------------
export const getDisplayData = (originalArray) => {
  const displayArray = []
  let index = 0
  do {
    if (originalArray[index].routeVisible === true) {
      displayArray.push(originalArray[index])
    }
    index += 1
  } while (index < originalArray.length)

  return displayArray
}

// -------------------------------------------------------
// Function to fetch all Shapes data
// -------------------------------------------------------
export const getAllShapes = async () => {
  const resultData = await axios({
    url: "http://localhost:4000/api/bus/shapes/",
    method: "GET",
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Now extract all unique shape_id and sort into ascending order
  const uniqueShapeIds = getShapeIDs(resultData.data)

  // Now reformat busShapesCollection into a new array
  const reformattedShapes = reformatShapesData(uniqueShapeIds, resultData.data)

  return reformattedShapes
}

// -------------------------------------------------------
// Function to fetch all GTFS Bus data into the SQL database
// -------------------------------------------------------
export const loadBusTransportDataHandler = () => {
  // The import GTFS function prepares the empty database table

  // Import GTFS Data from Website into local SQL database
  importGTFSBusData()
}

// Function to remove duplicates from array
// var removeDuplicates = (originalArray, prop) => {
//   return [...new Map(originalArray.map((item) => [item[prop], item])).values()]
// }

// Function to fetch Unique Gtfs Route data
// export var getRoutesData = async (url) => {
// const resultData = await fetchData(url, {})

// Filter out Duplicate Routes here
// let sortedDisplayArray = removeDuplicates(resultData.data, "routeNumber")

// Sort Routes code here
// let res = []
// sortedDisplayArray.sort((a, b) => (a.routeNumber > b.routeNumber ? 1 : -1))
// res[0] = sortedDisplayArray

// return res
// }
