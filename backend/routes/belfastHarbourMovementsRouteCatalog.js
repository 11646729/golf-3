import express from "express"
import {
  index,
  getBelfastHarbourMovements,
} from "../controllers/belfastHarbourMovementsController.js"
// import { importPortArrivalsAndVessels } from "../cruiseScrapingRoutines.js"

var belfastHarbourMovementsRouter = express.Router()

// ---------------------------------------------------
// Cruise Vessel Belfast Harbour Routes
// ---------------------------------------------------
// GET catalogue home page
belfastHarbourMovementsRouter.get("/", index)

// GET all Belfast Harbour Movements from the database
belfastHarbourMovementsRouter.get(
  "/getBelfastHarbourMovements",
  getBelfastHarbourMovements
)

export default belfastHarbourMovementsRouter
