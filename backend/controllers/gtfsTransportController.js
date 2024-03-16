import {
  importGtfs,
  // exportGtfs,
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
export var importGtfsToSQLite = async () => {
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
// Get Transport Agencies
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

// -------------------------------------------------------
// Bus Stops
// Path: localhost:4000/api/gtfs/stops
// -------------------------------------------------------
// export var getAllStops = (req, res) => {
//   // Open a Database Connection
//   let db = null
//   db = openSqlDbConnection(config.sqlitePath)

//   if (db !== null) {
//     try {
//       let sql = `SELECT stop_id, stop_lat, stop_lon FROM stops ORDER BY stop_id`
//       db.all(sql, [], (err, results) => {
//         if (err) {
//           return console.error(err.message)
//         }

//         res.send(results)
//       })

//       // Close the Database Connection
//       closeSqlDbConnection(db)
//     } catch (e) {
//       console.error(e.message)
//     }
//   } else {
//     console.error("Cannot connect to database")
//   }
// }

export default index
