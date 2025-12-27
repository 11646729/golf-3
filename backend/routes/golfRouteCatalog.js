import express from "express"
import {
  index,
  createGolfCoursesTable,
  getGolfCourses,
  importGolfCoursesData,
} from "../controllers/golfCourseController.js"

var golfRouter = express.Router()

// ---------------------------------------------------
// Golf Routes
// ---------------------------------------------------
// GET catalogue home page
golfRouter.get("/", index)

// Prepare the golfcourses table in the database
golfRouter.post("/createGolfCoursesTable", createGolfCoursesTable)

// POST all Golf Courses data into the database
golfRouter.post("/importGolfCoursesData", importGolfCoursesData)

// GET all Golf Courses data from the database
golfRouter.get("/getGolfCourses", getGolfCourses)

export default golfRouter
