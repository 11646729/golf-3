import express from "express"
import {
  index,
  importGtfsToSQLite,
  getAllShapes,
  // getShape,
  getAllStops,
  getAgencyName,
  getAllRoutes,
} from "../controllers/gtfsTransportController.js"

var gtfsRouter = express.Router()

// -------------------------------------------------------
// Bus Routes
// -------------------------------------------------------
// GET catalogue home page
gtfsRouter.get("/", index)

// POST all GTFS data into the SQL database
gtfsRouter.post("/importStaticGTFSData", importGtfsToSQLite)

// Bus Route Agency
gtfsRouter.get("/agencyname", getAgencyName)

// GET all Bus Route Shapes
gtfsRouter.get("/shapes", getAllShapes)

// GET a Bus Route Shape
// gtfsRouter.get("/shape", getShape)

// GET all Translink Bus Stops
gtfsRouter.get("/stops", getAllStops)

// GET all Bus Routes
gtfsRouter.get("/routes", getAllRoutes)

gtfsRouter.get("/routes", function (req, res) {
  res.send("GTFS Controller get Routes home page")
})

// GET all Selected Panel List Bus Routes
// gtfsRouter.get("/groutes/:routevisible", gtfsTransportController.getSelectedRoutes)

// GET all Translink Bus Routes
// gtfsRouter.get("/groutes/", gtfsTransportController.getAllTranslinkRoutes)

// PUT Selected Status in the Bus Routes documents
// gtfsRouter.put("/groutes/:routenumber", gtfsTransportController.putSelectedRoutes)

export default gtfsRouter
