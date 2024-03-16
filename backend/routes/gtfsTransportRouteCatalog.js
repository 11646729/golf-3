import express from "express"
import {
  index,
  importGtfsToSQLite,
  getAllAgencies,
  getRoutesForSingleAgency,
  getShapesForSingleRoute,
  getStopsForSingleRoute,
} from "../controllers/gtfsTransportController.js"

var gtfsRouter = express.Router()

// -------------------------------------------------------
// Bus Routes
// -------------------------------------------------------
// GET catalogue home page
gtfsRouter.get("/", index)

// POST all GTFS data into the SQL database
gtfsRouter.post("/importStaticGTFSData", importGtfsToSQLite)

// GET all Transport Agencies
gtfsRouter.get("/transportagencies", getAllAgencies)

//  GET Transport Routes for one Transport Agency
gtfsRouter.get("/routesforsingleagency", getRoutesForSingleAgency)

//  GET Shapes for one Transport Route
gtfsRouter.get("/shapesforsingleroute", getShapesForSingleRoute)

// GET Stops for one Transport Route
gtfsRouter.get("/stopsforsingleroute", getStopsForSingleRoute)

export default gtfsRouter
