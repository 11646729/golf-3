import express from "express"
import {
  index,
  importBelfastSchedule,
  getBelfastSchedule,
  getBelfastImportStatus,
  getAisGeoFilter,
  setAisGeoFilter,
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

// GET / POST AIS geographic filter state
cruiseRouter.get("/geoFilter", getAisGeoFilter)
cruiseRouter.post("/geoFilter", setAisGeoFilter)

export default cruiseRouter
