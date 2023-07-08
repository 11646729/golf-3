import express from "express"
import {
  index,
  prepareEmptySeismicDesignsTable,
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
  "/prepareSeismicDesignsTable",
  prepareEmptySeismicDesignsTable
)

// POST all Seismic Designs data into the database
// golfRouter.get("/importSeismicDesignsData", importSeismicDesignsData)

// GET all Seismic Designs data from the database
golfRouter.get("/getSeismicDesigns", getGolfCourses)

export default seismicDesignsRouter
