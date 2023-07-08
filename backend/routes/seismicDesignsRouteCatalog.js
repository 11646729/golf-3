import express from "express"
import {
  index,
  prepareEmptySeismicDesignsTable,
  // importGolfCoursesData,
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

// POST all Golf Courses data into the database
// golfRouter.get("/importGolfCoursesData", importGolfCoursesData)

// GET all Golf Courses data from the database
golfRouter.get("/getSeismicDesigns", getGolfCourses)

export default seismicDesignsRouter
