import express from "express"
import {
  index,
  prepareEmptyTemperaturesTable,
  getTemperaturesFromDatabase,
} from "../controllers/rtWeatherController.js"

var rtWeatherRouter = express.Router()

// ---------------------------------------------------
// Weather Routes
// ---------------------------------------------------
// GET catalogue home page
rtWeatherRouter.get("/", index)

// Prepare the temperatures table in the database
rtWeatherRouter.post("/prepareTemperaturesTable", prepareEmptyTemperaturesTable)

// GET all temperature readings from the database
rtWeatherRouter.get("/getTemperaturesData", getTemperaturesFromDatabase)

export default rtWeatherRouter
