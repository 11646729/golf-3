import express from "express"
import {
  getVesselPosition,
  getImportStatus,
} from "../controllers/vesselController.js"
import {
  index,
  importBelfastSchedule,
  getBelfastSchedule,
} from "../controllers/belfastScheduleController.js"

var cruiseRouter = express.Router()

// ---------------------------------------------------
// Cruise Routes
// ---------------------------------------------------
// GET catalogue home page
cruiseRouter.get("/", index)

// ---------------------------------------------------
// Belfast Harbour Cruise Schedule Routes
// ---------------------------------------------------
// POST trigger import of Belfast Harbour cruise schedule PDF
cruiseRouter.post("/importBelfastSchedule", importBelfastSchedule)

// GET Belfast Harbour cruise schedule data
cruiseRouter.get("/getBelfastSchedule", getBelfastSchedule)

// ---------------------------------------------------
// Vessel Routes
// ---------------------------------------------------
// GET current import job status (for frontend polling)
cruiseRouter.get("/importStatus", (_req, res) => res.json(getImportStatus()))

// GET all vessel positions
cruiseRouter.get("/vesselPositions", getVesselPosition)

export default cruiseRouter
