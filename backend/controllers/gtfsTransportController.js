import {
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
import { DatabaseAdapter } from "../databaseUtilities.js"
import { createGTFSTables } from "../createGTFSTables/createGTFSTables.js"
import { importGTFSStaticData } from "../importGTFSStaticData.js"
import getZipTimestamps from "../readZipFile.js"

// Database adapter for PostgreSQL integration (for logging, analytics, etc.) - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

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
      ["/api/gtfs", new Date().toISOString(), req.ip || "unknown"],
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
// Function to import latest GTFS Static file data to PostgreSQL database
// -------------------------------------------------------
export var importStaticGtfsData = async (req, res) => {
  const startTime = new Date()

  try {
    // Read ZIP timestamps and download/extract if newer
    const temp = await getZipTimestamps()

    if (temp === "SameDate") {
      return res
        .send({
          status: "no_update",
          message: "GTFS data is already up to date",
        })
        .status(200)
    } else {
      console.log("Proceeding with GTFS data import...")

      // Ensure GTFS tables exist in PostgreSQL
      const createTablesResults = await createGTFSTables()

      // Fetch URL for GTFS static data from environment variable
      const gtfsStaticDataUrl = process.env.RAW_TRANSPORT_FOR_IRELAND_FILEPATH
      console.log(`GTFS Static Data URL: ${gtfsStaticDataUrl}`)

      // Fetch GTFS static data from URL
      if (!gtfsStaticDataUrl) {
        throw new Error("GTFS static data URL is not defined")
      } else {
        console.log("Fetching GTFS static data...")
      }
      const fetchGTFSDataResults = await importGTFSStaticData()

      console.log(fetchGTFSDataResults)

      try {
        const duration = Date.now() - startTime.getTime()
        await getDb().run(
          `INSERT INTO gtfs_import_log (import_date, status, duration_ms)
         VALUES (?, ?, ?)
         ON CONFLICT DO NOTHING`,
          [startTime.toISOString(), "success", duration],
        )
      } catch (logError) {
        console.log("Failed to log import success:", logError.message)
      }
    }
  } catch (error) {
    console.log("Error importing GTFS static data:", error)

    try {
      await getDb().run(
        `INSERT INTO gtfs_import_log (import_date, status, error_message)
         VALUES (?, ?, ?)
         ON CONFLICT DO NOTHING`,
        [startTime.toISOString(), "failed", error.message],
      )
    } catch (logError) {
      console.log("Failed to log import failure:", logError.message)
    }

    res.status(500).send({ status: "error", message: error.message })
  }
}

// -------------------------------------------------------
// Function to import latest GTFS Realtime file data to PostgreSQL database
// -------------------------------------------------------
export var updateRealtimeGtfsToPostgreSQL = async () => {
  const startTime = new Date()

  try {
    await updateGtfsRealtime(config)

    // Log successful realtime update to PostgreSQL
    await getDb().run(
      `INSERT INTO gtfs_realtime_log (update_date, status) 
       VALUES (?, ?)`,
      [startTime.toISOString(), "success"],
    )
  } catch (error) {
    console.error("Realtime update failed:", error)

    // Log failed realtime update to PostgreSQL
    await getDb().run(
      `INSERT INTO gtfs_realtime_log (update_date, status, error_message) 
       VALUES (?, ?, ?)`,
      [startTime.toISOString(), "failed", error.message],
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
        ["agency_id", "agency_name"], // Only return these fields
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
        ],
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
        ["route_id", "agency_id", "route_short_name", "route_long_name"], // Only return these fields
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
        ],
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
        ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"], // Only return these fields
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
        ],
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
        [["stop_id", "ASC"]], // Sort by this field and direction
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
        ],
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
        ["vehicle_id", "latitude", "longitude"], // Only return these fields
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
          ],
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
          ],
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
          ],
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

export default index
