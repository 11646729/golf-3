import {
  importGtfs,
  // exportGtfs,
  updateGtfsRealtime,
  closeDb,
  openDb,
  getAgencies,
  getRoutes,
  getShapes,
  getStops,
} from "gtfs"
import * as fs from "fs"
import * as stream from "stream"
import decompress from "decompress"
import axios from "axios"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"
import fetch from "node-fetch"
import { promisify } from "util"

// import config from "../configHamilton.js"
// import config from "../configMetro.js"
import config from "../configTransportForIreland.js"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/gtfs
// -------------------------------------------------------
export var index = async (req, res) => {
  res.send({ response: "I am alive" }).status(200)
}

// -------------------------------------------------------
// Function to import latest GTFS Static file data to SQLite database
// -------------------------------------------------------
export var importStaticGtfsToSQLite = async () => {
  //  ----------------------------------------------------
  // THESE ARE SUSPECT AS THE TFI FORMATS HAVE CHANGED
  //  ----------------------------------------------------
  // await importGtfs(config)
  // await exportGtfs(config)

  //  Firstly download the most recent zip file of GTFS Static files
  const finishedDownload = promisify(stream.finished)
  const writer = fs.createWriteStream(config.tempFile)

  const response = await axios({
    method: "GET",
    url: config.agencies[0].url,
    responseType: "stream",
  })

  response.data.pipe(writer)

  await finishedDownload(writer)
    .then(() => {
      // Getting information for a file
      fs.stat(config.tempFile, (error, stats) => {
        if (error) {
          console.log(error)
        } else {
          console.log(
            "Zip file containing Static GTFS files imported successfully. "
          )
          console.log("Zip file created at: " + stats.birthtime)
        }
      })
    })
    //  Secondly unzip the GTFS Static files from the zipfile
    .then(() => {
      decompress(config.tempFile, config.agencies[0].path)
        // sqlitePath)
        .then((files) => {
          // console.log(files)
        })
        .catch((error) => {
          console.log(error)
        })
    })
    //  Thirdly import the GTFS Static files into the gtfs.db database
    .then(() => {
      try {
        importGtfs(config)
          .then(() => {
            // return
            console.log("Import Successful")
          })
          .catch((err) => {
            console.error(err)
          })
      } catch (error) {
        console.log("\n\nError in importGtfsToSQLite: ", error)
      }
    })
}

// -------------------------------------------------------
// Function to import latest GTFS Realtime file data to SQLite database
// -------------------------------------------------------
export var importRealtimeGtfsToSQLite = async () => {
  // console.log("Here")

  // -----------------------------------------------------
  // ;(async () => {
  try {
    const response = await fetch(
      "https://api.nationaltransport.ie/gtfsr/v2/gtfsr",
      {
        headers: {
          "x-api-key": "80d8d0ad2a844dd2a6dcc4c8ed702f8d",
          // replace with your GTFS-realtime source's auth token
          // e.g. x-api-key is the header value used for NY's MTA GTFS APIs
        },
      }
    )
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      )
      error.response = response
      throw error
      process.exit(1)
    }
    const buffer = await response.arrayBuffer()
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    )
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        console.log(entity.tripUpdate)
      }
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
// })()
// -----------------------------------------------------

// var config1 = {
//   agencies: [
//     {
//       agency_key: "Transport For Ireland",
//       path: "/Users/briansmith/Documents/GTD/golf-3/backend/gtfs_data/TransportForIreland",
//       // url: "https://www.transportforireland.ie/transitData/Data/GTFS_Realtime.zip",
//       realtimeUrls: "https://api.nationaltransport.ie/gtfsr/v2/gtfsr",
//       realtimeHeaders: {
//         "Content-Type": "application/json",
//         // "Cache-Control": "no-cache",
//         "x-api-key": "80d8d0ad2a844dd2a6dcc4c8ed702f8d",
//       },
//     },
//   ],
//   // realtimeUrls: "https://api.nationaltransport.ie/gtfsr/v2/gtfsr",
//   verbose: true,
//   sqlitePath:
//     "/Users/briansmith/Documents/GTD/golf-3/backend/gtfs_data/TransportForIreland/gtfs.db",
//   exportPath:
//     "/Users/briansmith/Documents/GTD/golf-3/backend/gtfs_data/TransportForIreland/",
//   tempFile: "/Users/briansmith/Desktop/GTFS_Realtime.zip",
// }

// // This function prepares an empty database & imports Realtime GTFS Data into local SQL database
// const url = "https://api.nationaltransport.ie/gtfsr/v2/gtfsr?format=json"
// const params = {
//   // format: "json",
// }
// const config1 = {
//   timeout: 20000,
//   headers: {
//     "Cache-Control": "no-cache",
//     "x-api-key": "80d8d0ad2a844dd2a6dcc4c8ed702f8d",
//   },
// }

// await axios
//   .get(url, params, config)
//   .then((response) => {
//     console.log(response.status)
//     console.log(response.text())
//   })
//   .then(() => alert("Realtime GTFS data has been Imported to SQL database"))
//   .catch((err) => console.log(err))

//   await updateGtfsRealtime(config1)
// }

// -------------------------------------------------------
// Get All Transport Agencies
// Path: localhost:4000/api/gtfs/agencies
// -------------------------------------------------------
export var getAllAgencies = (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const agencies = getAgencies(
        {}, // No query filters
        ["agency_id", "agency_name"] // Only return these fields
      )

      res.send(agencies)
    } catch (e) {
      console.error(e.message)
    }

    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get All Routes for a single Transport Agency
// Path: localhost:4000/api/gtfs/routesforsingleagency
// -------------------------------------------------------
export var getRoutesForSingleAgency = (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const db = openDb(config)
      const transportRoutes = getRoutes(
        { agency_id: req.query.transportAgencyId }, // Query filters
        ["route_id", "agency_id", "route_short_name", "route_long_name"] // Only return these fields
      )

      res.send(transportRoutes)
    } catch (e) {
      console.error(e.message)
    }

    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get All Shapes for a single Route
// Path: localhost:4000/api/gtfs/shapesforsingleroute
// -------------------------------------------------------
export var getShapesForSingleRoute = (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const db = openDb(config)

      const transportShapes = getShapes(
        { route_id: req.query.routeId }, // Query filters
        ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"] // Only return these fields
      )

      res.send(transportShapes)
    } catch (e) {
      console.error(e.message)
    }

    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get All Stops for a single Route
// Path: localhost:4000/api/gtfs/stopsforsingleroute
// -------------------------------------------------------
export var getStopsForSingleRoute = (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const db = openDb(config)

      const transportStops = getStops(
        { route_id: req.query.routeId }, // Query filters
        ["stop_id", "stop_lat", "stop_lon"], // Only return these fields
        [["stop_id", "ASC"]] // Sort by this field and direction
      )

      res.send(transportStops)
    } catch (e) {
      console.error(e.message)
    }

    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

export default index
