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
  getVehiclePositions,
  getTripUpdates,
  getTrips,
} from "gtfs"
import * as fs from "fs"
import * as stream from "stream"
import decompress from "decompress"
import axios from "axios"
import { promisify } from "util"
import readRouteFile from "../fileUtilities.js"
const config = readRouteFile(process.env.TRANSPORT_FOR_IRELAND_FILEPATH)

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
  // importGtfs(config)
  // exportGtfs(config)

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
      fs.stat(config.tempFile, (err, stats) => {
        console.log(
          "Zip file containing Static GTFS files imported successfully. "
        )

        if (err) {
          console.log(err)
        }

        fs.unlink(config.tempFile, (err) => {
          if (err) return console.log(err)
          console.log("Temporary File deleted successfully")
        })
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
export var updateRealtimeGtfsToSQLite = async () => {
  updateGtfsRealtime(config)
}

// -------------------------------------------------------
// Function to start Regular Updates of GTFS Realtime data
// -------------------------------------------------------
export var startRegularUpdatesOfRealtimeGTFSData = async () => {
  // getAllVehiclePositions()
  getAllTrips()
  // getAllTripUpdates()
}

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
// Get All Vehicle Positions
// Path: localhost:4000/api/gtfs/vehiclepositions
// -------------------------------------------------------
export const getAllVehiclePositions = async (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const vehiclePositions = getVehiclePositions(
        { trip_id: "4039_7117" }, // Query filters
        ["vehicle_id", "latitude", "longitude"] // Only return these fields
      )

      console.log(vehiclePositions)
      // res.send(vehiclePositions)
    } catch (e) {
      console.error(e.message)
    }
    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get All Trips
// Path: localhost:4000/api/gtfs/trips
// -------------------------------------------------------
const getAllTrips = async (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const trips = getTrips({
        route_id: "4021_65706",
        direction_id: 1,
      })
      console.log(trips)

      // res.send(trips)
    } catch (e) {
      console.error(e.message)
    }
    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get All Trip Updates
// Path: localhost:4000/api/gtfs/tripupdates
// -------------------------------------------------------
const getAllTripUpdates = async (req, res) => {
  const db = openDb(config)

  if (db !== null) {
    try {
      const tripUpdates = getTripUpdates()
      console.log(tripUpdates)

      // res.send(tripUpdates)
    } catch (e) {
      console.error(e.message)
    }
    closeDb(db)
  } else {
    console.error("Cannot connect to database")
  }
}

export default index
