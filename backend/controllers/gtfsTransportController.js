import { DatabaseAdapter } from "../databaseUtilities.js"
import { importGTFSStaticData } from "../importGTFSStaticData.js"
import readZipTimestamps from "../readZipTimestamps.js"
import readRouteFile from "../readGtfsFiles.js"

// Load GTFS config
const defaultConfigPath = new URL(
  "../gtfs_config_files/configTransportForIrelandPostgres.json",
  import.meta.url,
).pathname

const config = readRouteFile(
  process.env.TRANSPORT_FOR_IRELAND_FILEPATH || defaultConfigPath,
)

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
    const temp = await readZipTimestamps()

    if (temp === "SameDate") {
      console.log("GTFS data is already up to date; no import needed.")

      return res
        .send({
          status: "no_update",
          message: "GTFS data is already up to date",
        })
        .status(200)
    } else {
      // Import GTFS static data into PostgreSQL
      console.log("Importing GTFS static data into PostgreSQL...")

      // Fetch URL for GTFS static data from environment variable
      const gtfsStaticDataUrl = process.env.RAW_TRANSPORT_FOR_IRELAND_FILEPATH

      // Fetch GTFS static data from URL
      if (!gtfsStaticDataUrl) {
        throw new Error("GTFS static data URL is not defined")
      } else {
        console.log("Fetching GTFS static data...")

        await importGTFSStaticData()

        console.log("GTFS static data import complete.")

        return res
          .send({
            status: "success",
            message: "GTFS data is up to date",
          })
          .status(200)
      }

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
  }
}

// -------------------------------------------------------
// Function to import latest GTFS Realtime file data to PostgreSQL database
// -------------------------------------------------------
export var updateRealtimeGtfsToPostgreSQL = async () => {
  const startTime = new Date()

  try {
    // TODO: Implement PostgreSQL-based GTFS realtime update
    // The gtfs library's updateGtfsRealtime uses SQLite and has been removed
    console.log("GTFS realtime update - PostgreSQL implementation needed")

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
// Path: localhost:4000/api/gtfs/transportagencies
// -------------------------------------------------------
export var getAllAgencies = async (req, res) => {
  try {
    const agencies = await getDb().all(
      `SELECT agency_id, agency_name FROM agency`,
    )

    // Log successful query to PostgreSQL
    await getDb().run(
      `INSERT INTO api_access_log (endpoint, timestamp, ip_address, record_count) 
       VALUES (?, ?, ?, ?)`,
      [
        "/api/gtfs/transportagencies",
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
}

// -------------------------------------------------------
// Get All Routes for a single Transport Agency
// Path: localhost:4000/api/gtfs/routesforsingleagency
// -------------------------------------------------------
export var getRoutesForSingleAgency = async (req, res) => {
  try {
    const transportRoutes = await getDb().all(
      `SELECT route_id, agency_id, route_short_name, route_long_name 
       FROM routes WHERE agency_id = ?`,
      [req.query.transportAgencyId],
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
}

// -------------------------------------------------------
// Get All Shapes for a single Route
// Path: localhost:4000/api/gtfs/shapesforsingleroute
// -------------------------------------------------------
export var getShapesForSingleRoute = async (req, res) => {
  try {
    const transportShapes = await getDb().all(
      `SELECT shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence 
       FROM shapes WHERE shape_id IN (
         SELECT DISTINCT shape_id FROM trips WHERE route_id = ?
       ) ORDER BY shape_pt_sequence ASC`,
      [req.query.routeId],
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
}

// -------------------------------------------------------
// Get All Stops for a single Route
// Path: localhost:4000/api/gtfs/stopsforsingleroute
// -------------------------------------------------------
export var getStopsForSingleRoute = async (req, res) => {
  try {
    const transportStops = await getDb().all(
      `SELECT DISTINCT s.stop_id, s.stop_lat, s.stop_lon 
       FROM stops s
       JOIN stop_times st ON s.stop_id = st.stop_id
       JOIN trips t ON st.trip_id = t.trip_id
       WHERE t.route_id = ?
       ORDER BY s.stop_id ASC`,
      [req.query.routeId],
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
}

// -------------------------------------------------------
// Get All Vehicle Positions
// Path: localhost:4000/api/gtfs/vehiclepositions
// -------------------------------------------------------
export const getAllVehiclePositions = async (req, res) => {
  try {
    const vehiclePositions = await getDb().all(
      `SELECT vehicle_id, latitude, longitude 
       FROM vehicle_positions WHERE trip_id = ?`,
      ["4039_7117"],
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
}

// -------------------------------------------------------
// Get All Trips
// Path: localhost:4000/api/gtfs/trips
// -------------------------------------------------------
const getAllTrips = async (req, res) => {
  try {
    const trips = await getDb().all(
      `SELECT * FROM trips WHERE route_id = ? AND direction_id = ?`,
      ["4021_65706", 1],
    )
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
}

// -------------------------------------------------------
// Get All Trip Updates
// Path: localhost:4000/api/gtfs/tripupdates
// -------------------------------------------------------
const getAllTripUpdates = async (req, res) => {
  try {
    const tripUpdates = await getDb().all(`SELECT * FROM trip_updates`)
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
}

export default index
