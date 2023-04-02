import express from "express"
import {
  index,
  importGtfsToSQLite,
  getAllShapes,
  getShape,
  getAllStops,
  getAgencyName,
  getAllRoutes,
} from "../controllers/busController.js"

var busRouter = express.Router()

// -------------------------------------------------------
// Bus Routes
// -------------------------------------------------------
// GET catalogue home page
busRouter.get("/", index)

// POST all GTFS data into the SQL database
busRouter.post("/importGTFSBusData", importGtfsToSQLite)

// GET all Bus Route Shapes
busRouter.get("/shapes", getAllShapes)

// GET a Bus Route Shape
busRouter.get("/shape", getShape)

// GET all Bus Stops
// busRouter.get("/gstop", getAllStops)

// GET all Translink Bus Stops
busRouter.get("/stops", getAllStops)

// Bus Route Agency
busRouter.get("/agencyname", getAgencyName)

// GET all Bus Routes
busRouter.get("/routes", getAllRoutes)

busRouter.get("/routes", function (req, res) {
  res.send("Bus Controller get Routes home page")
})

// GET all Selected Panel List Bus Routes
// busRouter.get("/groutes/:routevisible", busController.getSelectedRoutes)

// GET all Translink Bus Routes
// busRouter.get("/groutes/", busController.getAllTranslinkRoutes)

// PUT Selected Status in the Bus Routes documents
// busRouter.put("/groutes/:routenumber", busController.putSelectedRoutes)

export default busRouter
