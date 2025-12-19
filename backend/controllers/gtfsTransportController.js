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
import readRouteFile from "../readGtfsFiles.js"
import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

// Use an environment variable if provided, otherwise fall back to the
// repository config file in gtfs_config_files.
const defaultConfigPath = new URL(
  "../gtfs_config_files/configTransportForIreland.json",
  import.meta.url
).pathname
const configPath =
  process.env.TRANSPORT_FOR_IRELAND_FILEPATH || defaultConfigPath
// console.log(`Using GTFS config file: ${configPath}`)
const config = readRouteFile(configPath)

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/gtfs
// -------------------------------------------------------
export var index = async (req, res) => {
  try {
    // Log API access to PostgreSQL for analytics
    await getDb().run(
      `INSERT INTO api_access_log (endpoint, timestamp, ip_address) 
       VALUES (?, ?, ?) 
       ON CONFLICT DO NOTHING`,
      ["/api/gtfs", new Date().toISOString(), req.ip || "unknown"]
    )
  } catch (error) {
    console.log("Failed to log API access:", error.message)
  }

  res
    .send({
      response: "GTFS Transport Controller - I am alive",
      database: "Uses PostgreSQL for application data",
      status: "postgresql-mode",
    })
    .status(200)
}

// -------------------------------------------------------
// Function to import latest GTFS Static file data to SQLite database
// -------------------------------------------------------
export var importStaticGtfsToSQLite = async () => {
  const startTime = new Date()

  try {
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
      .then(async () => {
        try {
          await importGtfs(config)
          console.log("Import Successful")

          // Log successful import to PostgreSQL
          const endTime = new Date()
          const duration = endTime - startTime

          await getDb().run(
            `INSERT INTO gtfs_import_log (import_date, status, duration_ms, file_size_mb) 
             VALUES (?, ?, ?, ?)`,
            [startTime.toISOString(), "success", duration, 0] // file size can be calculated if needed
          )
        } catch (err) {
          console.error(err)

          // Log failed import to PostgreSQL
          await getDb().run(
            `INSERT INTO gtfs_import_log (import_date, status, error_message) 
             VALUES (?, ?, ?)`,
            [startTime.toISOString(), "failed", err.message]
          )
        }
      })
  } catch (error) {
    console.log("\n\nError in importGtfsToSQLite: ", error)

    // Log error to PostgreSQL
    try {
      await getDb().run(
        `INSERT INTO gtfs_import_log (import_date, status, error_message) 
         VALUES (?, ?, ?)`,
        [startTime.toISOString(), "error", error.message]
      )
    } catch (logError) {
      console.log("Failed to log error to PostgreSQL:", logError.message)
    }
  }
}

// -------------------------------------------------------
// Function to import latest GTFS Realtime file data to SQLite database
// -------------------------------------------------------
export var updateRealtimeGtfsToSQLite = async () => {
  const startTime = new Date()

  try {
    await updateGtfsRealtime(config)

    // Log successful realtime update to PostgreSQL
    await getDb().run(
      `INSERT INTO gtfs_realtime_log (update_date, status) 
       VALUES (?, ?)`,
      [startTime.toISOString(), "success"]
    )
  } catch (error) {
    console.error("Realtime update failed:", error)

    // Log failed realtime update to PostgreSQL
    await getDb().run(
      `INSERT INTO gtfs_realtime_log (update_date, status, error_message) 
       VALUES (?, ?, ?)`,
      [startTime.toISOString(), "failed", error.message]
    )
  }
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
export var getAllAgencies = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const agencies = getAgencies(
        {}, // No query filters
        ["agency_id", "agency_name"] // Only return these fields
      )

      // Log successful query to PostgreSQL
      await getDb().run(
        `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
         VALUES (?, ?, ?, ?)`,
        [
          "/api/gtfs/agencies",
          new Date().toISOString(),
          req.ip || "unknown",
          agencies.length,
        ]
      )

      res.send(agencies)
    } catch (e) {
      console.error(e.message)
      res.status(500).send({ error: "Failed to fetch agencies" })
    }

    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    res.status(500).send({ error: "Database connection failed" })
  }
}

// -------------------------------------------------------
// Get All Routes for a single Transport Agency
// Path: localhost:4000/api/gtfs/routesforsingleagency
// -------------------------------------------------------
export var getRoutesForSingleAgency = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const transportRoutes = getRoutes(
        { agency_id: req.query.transportAgencyId }, // Query filters
        ["route_id", "agency_id", "route_short_name", "route_long_name"] // Only return these fields
      )

      // Log successful query to PostgreSQL
      await getDb().run(
        `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
         VALUES (?, ?, ?, ?)`,
        [
          "/api/gtfs/routesforsingleagency",
          new Date().toISOString(),
          req.ip || "unknown",
          transportRoutes.length,
        ]
      )

      res.send(transportRoutes)
    } catch (e) {
      console.error(e.message)
      res.status(500).send({ error: "Failed to fetch routes" })
    }

    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    res.status(500).send({ error: "Database connection failed" })
  }
}

// -------------------------------------------------------
// Get All Shapes for a single Route
// Path: localhost:4000/api/gtfs/shapesforsingleroute
// -------------------------------------------------------
export var getShapesForSingleRoute = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const transportShapes = getShapes(
        { route_id: req.query.routeId }, // Query filters
        ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"] // Only return these fields
      )

      // Log successful query to PostgreSQL
      await getDb().run(
        `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
         VALUES (?, ?, ?, ?)`,
        [
          "/api/gtfs/shapesforsingleroute",
          new Date().toISOString(),
          req.ip || "unknown",
          transportShapes.length,
        ]
      )

      res.send(transportShapes)
    } catch (e) {
      console.error(e.message)
      res.status(500).send({ error: "Failed to fetch shapes" })
    }

    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    res.status(500).send({ error: "Database connection failed" })
  }
}

// -------------------------------------------------------
// Get All Stops for a single Route
// Path: localhost:4000/api/gtfs/stopsforsingleroute
// -------------------------------------------------------
export var getStopsForSingleRoute = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const transportStops = getStops(
        { route_id: req.query.routeId }, // Query filters
        ["stop_id", "stop_lat", "stop_lon"], // Only return these fields
        [["stop_id", "ASC"]] // Sort by this field and direction
      )

      // Log successful query to PostgreSQL
      await getDb().run(
        `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
         VALUES (?, ?, ?, ?)`,
        [
          "/api/gtfs/stopsforsingleroute",
          new Date().toISOString(),
          req.ip || "unknown",
          transportStops.length,
        ]
      )

      res.send(transportStops)
    } catch (e) {
      console.error(e.message)
      res.status(500).send({ error: "Failed to fetch stops" })
    }

    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    res.status(500).send({ error: "Database connection failed" })
  }
}

// -------------------------------------------------------
// Get All Vehicle Positions
// Path: localhost:4000/api/gtfs/vehiclepositions
// -------------------------------------------------------
export const getAllVehiclePositions = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const vehiclePositions = getVehiclePositions(
        { trip_id: "4039_7117" }, // Query filters
        ["vehicle_id", "latitude", "longitude"] // Only return these fields
      )

      console.log(vehiclePositions)

      if (res) {
        // Log successful query to PostgreSQL
        await getDb().run(
          `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
           VALUES (?, ?, ?, ?)`,
          [
            "/api/gtfs/vehiclepositions",
            new Date().toISOString(),
            req?.ip || "unknown",
            vehiclePositions.length,
          ]
        )

        res.send(vehiclePositions)
      }
    } catch (e) {
      console.error(e.message)
      if (res) {
        res.status(500).send({ error: "Failed to fetch vehicle positions" })
      }
    }
    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    if (res) {
      res.status(500).send({ error: "Database connection failed" })
    }
  }
}

// -------------------------------------------------------
// Get All Trips
// Path: localhost:4000/api/gtfs/trips
// -------------------------------------------------------
const getAllTrips = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const trips = getTrips({
        route_id: "4021_65706",
        direction_id: 1,
      })
      console.log(trips)

      if (res) {
        // Log successful query to PostgreSQL
        await getDb().run(
          `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
           VALUES (?, ?, ?, ?)`,
          [
            "/api/gtfs/trips",
            new Date().toISOString(),
            req?.ip || "unknown",
            trips.length,
          ]
        )

        res.send(trips)
      }
    } catch (e) {
      console.error(e.message)
      if (res) {
        res.status(500).send({ error: "Failed to fetch trips" })
      }
    }
    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    if (res) {
      res.status(500).send({ error: "Database connection failed" })
    }
  }
}

// -------------------------------------------------------
// Get All Trip Updates
// Path: localhost:4000/api/gtfs/tripupdates
// -------------------------------------------------------
const getAllTripUpdates = async (req, res) => {
  const gtfsDb = openDb(config)

  if (gtfsDb !== null) {
    try {
      const tripUpdates = getTripUpdates()
      console.log(tripUpdates)

      if (res) {
        // Log successful query to PostgreSQL
        await getDb().run(
          `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
           VALUES (?, ?, ?, ?)`,
          [
            "/api/gtfs/tripupdates",
            new Date().toISOString(),
            req?.ip || "unknown",
            tripUpdates.length,
          ]
        )

        res.send(tripUpdates)
      }
    } catch (e) {
      console.error(e.message)
      if (res) {
        res.status(500).send({ error: "Failed to fetch trip updates" })
      }
    }
    closeDb(gtfsDb)
  } else {
    console.error("Cannot connect to GTFS database")
    if (res) {
      res.status(500).send({ error: "Database connection failed" })
    }
  }
}

// -------------------------------------------------------
// PostgreSQL Helper Functions for GTFS Analytics
// -------------------------------------------------------

// Create necessary PostgreSQL tables for GTFS logging and analytics
export const createGtfsTables = async () => {
  try {
    // Check if tables already exist
    const tableCheck = await getDb().get(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('api_access_log', 'gtfs_import_log', 'gtfs_realtime_log')
    `)

    // If all 3 tables exist, skip creation
    if (tableCheck && parseInt(tableCheck.count) === 3) {
      return
    }

    // API access log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS api_access_log (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        record_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GTFS import log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS gtfs_import_log (
        id SERIAL PRIMARY KEY,
        import_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL,
        duration_ms INTEGER,
        file_size_mb DECIMAL(10,2),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // GTFS realtime log table
    await getDb().run(`
      CREATE TABLE IF NOT EXISTS gtfs_realtime_log (
        id SERIAL PRIMARY KEY,
        update_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("GTFS PostgreSQL logging tables created successfully")
  } catch (error) {
    console.error("Failed to create GTFS PostgreSQL tables:", error.message)
  }
}

// Initialize GTFS tables on startup
createGtfsTables()

export default index
