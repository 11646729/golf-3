import express from "express"
import {
  index,
  importGtfsToSQLite,
  getAllAgencyNames,
  getRoutesForSingleAgency,
  getShapesForSingleRoute,
  getAllStops,
} from "../controllers/gtfsTransportController.js"

var gtfsRouter = express.Router()

// -------------------------------------------------------
// Bus Routes
// -------------------------------------------------------
// GET catalogue home page
gtfsRouter.get("/", index)

// POST all GTFS data into the SQL database
gtfsRouter.post("/importStaticGTFSData", importGtfsToSQLite)

// GET all Transport Route Agencies
gtfsRouter.get("/agencynames", getAllAgencyNames)

//  GET Transport Routes for one Agency
gtfsRouter.get("/routesforsingleagency", getRoutesForSingleAgency)

//  GET Shapes for one Route
gtfsRouter.get("/shapesforsingleroute", getShapesForSingleRoute)

// GET all Translink Bus Stops
gtfsRouter.get("/stops", getAllStops)

export default gtfsRouter
