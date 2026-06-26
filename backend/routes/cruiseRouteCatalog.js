import express from "express"
import {
  index,
  importBelfastSchedule,
  getBelfastSchedule,
  getBelfastImportStatus,
  getVesselPositions,
  getAisGeoFilter,
  setAisGeoFilter,
  scrapeVesselPosition,
} from "../controllers/belfastScheduleController.js"

var cruiseRouter = express.Router()

// ---------------------------------------------------
// Belfast Harbour Cruise Schedule Routes
// ---------------------------------------------------
// GET catalogue home page
cruiseRouter.get("/", index)

// POST trigger import of Belfast Harbour cruise schedule PDF
cruiseRouter.post("/importBelfastSchedule", importBelfastSchedule)

// GET current Belfast import job status (for frontend polling)
cruiseRouter.get("/getBelfastImportStatus", (_req, res) =>
  res.json(getBelfastImportStatus()),
)

// GET Belfast Harbour cruise schedule data
cruiseRouter.get("/getBelfastSchedule", getBelfastSchedule)

// GET current AIS vessel positions
cruiseRouter.get("/vesselPositions", getVesselPositions)

// GET / POST AIS geographic filter state
cruiseRouter.get("/geoFilter", getAisGeoFilter)
cruiseRouter.post("/geoFilter", setAisGeoFilter)

// POST scrape current vessel position from CruiseMapper  { vesselname }
cruiseRouter.post("/scrapePosition", scrapeVesselPosition)

export default cruiseRouter
