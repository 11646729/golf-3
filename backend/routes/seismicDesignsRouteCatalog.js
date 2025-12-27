import express from "express"
import {
  index,
  createSeismicDesignsTable,
  // importSeismicDesignsData,
  getSeismicDesigns,
} from "../controllers/seismicDesignsController.js"

var seismicDesignsRouter = express.Router()

// ---------------------------------------------------
// Seismic Designs Routes
// ---------------------------------------------------
// GET catalogue home page
seismicDesignsRouter.get("/", index)

// Prepare the seismicdesigns table in the database
seismicDesignsRouter.post(
  "/createSeismicDesignsTable",
  createSeismicDesignsTable
)

// POST all Seismic Designs data into the database
// seismicDesignsRouter.get("/importSeismicDesignsData", importSeismicDesignsData)

// GET all Seismic Designs data from the database
seismicDesignsRouter.get("/getSeismicDesigns", getSeismicDesigns)

export default seismicDesignsRouter
