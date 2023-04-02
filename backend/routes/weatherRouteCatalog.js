import express from "express"
import {
  index,
  prepareEmptyTemperaturesTable,
  getTemperaturesFromDatabase,
} from "../controllers/weatherController.js"

var weatherRouter = express.Router()

// ---------------------------------------------------
// Weather Routes
// ---------------------------------------------------
// GET catalogue home page
weatherRouter.get("/", index)

// Prepare the temperatures table in the database
weatherRouter.post("/prepareTemperaturesTable", prepareEmptyTemperaturesTable)

// GET all temperature readings from the database
weatherRouter.get("/getTemperaturesData", getTemperaturesFromDatabase)

export default weatherRouter
