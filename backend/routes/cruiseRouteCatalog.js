import express from "express"
import {
  index,
  importBelfastSchedule,
  getBelfastSchedule,
  getBelfastImportStatus,
  getVesselPositions,
  refreshVesselPosition,
  getAisGeoFilter,
  setAisGeoFilter,
} from "../controllers/belfastScheduleController.js"

var cruiseRouter = express.Router()

// ---------------------------------------------------
// Belfast Harbour Cruise Schedule Routes
// ---------------------------------------------------
// ---------------------------------------------------
// GET catalogue home page
// ---------------------------------------------------
cruiseRouter.get("/", index)

// ---------------------------------------------------
// GET current Belfast import job status (for frontend polling)
// ---------------------------------------------------
cruiseRouter.get("/getBelfastImportStatus", (_req, res) =>
  res.json(getBelfastImportStatus()),
)

// ---------------------------------------------------
// POST trigger import of Belfast Harbour cruise schedule PDF
// ---------------------------------------------------
cruiseRouter.post("/importBelfastSchedule", importBelfastSchedule)

// ---------------------------------------------------
// GET Belfast Harbour cruise schedule data
// ---------------------------------------------------
cruiseRouter.get("/getBelfastSchedule", getBelfastSchedule)

// ---------------------------------------------------
// GET current vessel positions
// ---------------------------------------------------
cruiseRouter.get("/getVesselPositions", getVesselPositions)

// ---------------------------------------------------
// POST scrape one vessel's current position from CruiseMapper
// ---------------------------------------------------
cruiseRouter.post("/refreshVesselPosition", refreshVesselPosition)

// ---------------------------------------------------
// GET / POST AIS geographic filter state: Called from CruiseMap
// ---------------------------------------------------
cruiseRouter.get("/geoFilter", getAisGeoFilter)
cruiseRouter.post("/geoFilter", setAisGeoFilter)

export default cruiseRouter
