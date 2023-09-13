import express from "express"
import {
  index,
  prepareEmptyRTNewsTable,
  importRTNewsItemsFromFile,
  getLiveRTNewsItems,
} from "../controllers/rtNewsController.js"

var rtNewsRouter = express.Router()

// ---------------------------------------------------
// Real Time News Routes
// ---------------------------------------------------
// GET catalogue home page
rtNewsRouter.get("/", index)

// Prepare the RTNews table in the database
rtNewsRouter.post("/prepareEmptyRTNewsTable", prepareEmptyRTNewsTable)

// POST all RT News Items into the database
rtNewsRouter.post("/importRTNewsItemsFromFile", importRTNewsItemsFromFile)

// GET all RT News Items from the database
rtNewsRouter.get("/getRTNewsItems", getLiveRTNewsItems)

export default rtNewsRouter
