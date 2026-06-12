import express from "express"
import {
  index,
  importBelfastSchedule,
  getBelfastSchedule,
  getBelfastImportStatus,
} from "../controllers/belfastScheduleController.js"
import {
  getVesselPosition,
  getImportStatus,
} from "../controllers/vesselController.js"

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

// ---------------------------------------------------
// Vessel Routes
// ---------------------------------------------------
// GET all vessel positions
cruiseRouter.get("/vesselPositions", getVesselPosition)

// GET current import job status (for frontend polling)
cruiseRouter.get("/importStatus", (_req, res) => res.json(getImportStatus()))

export default cruiseRouter
