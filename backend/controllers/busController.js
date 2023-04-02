import { importGtfs } from "gtfs"
import config from "../configHamilton.js"
// import config from "../configMetro.js"
// import config from "../configDublin.js"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/bus/
// -------------------------------------------------------
export var index = async (req, res) => {
  res.send({ response: "I am alive" }).status(200)
}

// -------------------------------------------------------
// Function to import GTFS data to SQLite database
// -------------------------------------------------------
export var importGtfsToSQLite = (showResult) => {
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
}

// -------------------------------------------------------
// Bus Route Shapes
// Path: localhost:4000/api/bus/shapes/
// -------------------------------------------------------
export var getAllShapes = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.HAMILTON_SQL_URI)

  let newResults = null

  if (db !== null) {
    try {
      let sql = `SELECT * FROM shapes ORDER BY shape_id, shape_pt_sequence`
      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Bus Route Shape
// Path: localhost:4000/api/bus/shape/:shapeID
// -------------------------------------------------------
export var getShape = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.HAMILTON_SQL_URI)

  let newResults = null
  let shapeID = req.query.shape

  if (db !== null) {
    try {
      let sql = `SELECT shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence FROM shapes WHERE shape_id = ${shapeID} ORDER BY shape_id, shape_pt_sequence`
      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }

        newResults = consolidateShapeCoordinates(results, shapeID)

        res.send(newResults)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Bus Stops
// Path: localhost:4000/api/bus/stops/
// -------------------------------------------------------
export var getAllStops = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.HAMILTON_SQL_URI)

  if (db !== null) {
    try {
      let sql = `SELECT stop_id, stop_lat, stop_lon FROM stops ORDER BY stop_id`
      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Bus Agency Name
// Path: localhost:4000/api/bus/agencyname/
// -------------------------------------------------------
export var getAgencyName = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.HAMILTON_SQL_URI)

  if (db !== null) {
    try {
      let sql = `SELECT agency_name FROM agency`
      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Bus Routes
// Path: localhost:4000/api/bus/routes/
// -------------------------------------------------------
export var getAllRoutes = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.HAMILTON_SQL_URI)

  if (db !== null) {
    try {
      let sql = `SELECT route_id AS routeId, agency_id AS agencyId, route_short_name AS routeShortName, route_long_name AS routeLongName, route_desc AS routeDesc, route_url AS routeUrl, route_color AS routeColor, route_text_color AS routeTextColor, route_sort_order AS routeSortOrder, continuous_pickup as continuousPickup, continuous_drop_off AS continuousDropOff FROM routes ORDER BY route_short_name`
      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Get Panel Selected Routes
// -------------------------------------------------------
export var getSelectedRoutes = async (req, res) => {
  const filter = { routeVisible: "true" }

  console.log("Probably to do")

  // RouteSchema.find(filter)
  //   .then((routeSchema) => res.json(routeSchema))
  //   .catch((err) => res.status(400).json("Error " + err))
}

// -------------------------------------------------------
// Update Selected Routes
// -------------------------------------------------------
export const putSelectedRoutes = async (req, res) => {
  const filter = { routeNumber: req.body.routeNumber }
  const update = { routeVisible: req.body.routeVisible }

  console.log("Probably to do")

  // RouteSchema.updateMany(filter, update)
  //   .then((routeSchema) => res.json(routeSchema))
  //   .catch((err) => res.status(400).json("Error " + err))
}

// -------------------------------------------------------
// Local function
// Function to put all Shapes coordinates into an array
// -------------------------------------------------------
const consolidateShapeCoordinates = (results, shapeID) => {
  // Guard clause
  if (results == null) return

  let j = 0
  let pathArray = []
  let loopend = results.length
  let newResults = {}

  do {
    var coords = {
      lat: results[j].shape_pt_lat,
      lng: results[j].shape_pt_lon,
    }

    pathArray.push(coords)

    j++
  } while (j < loopend)

  newResults.shapeKey = shapeID
  newResults.shapeCoordinates = pathArray

  return newResults
}

export default getAllShapes
