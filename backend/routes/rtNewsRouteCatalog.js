import express from "express"
import {
  index,
  // prepareEmptyRTNewsTable,
  getNewsItemsFromDatabase,
} from "../controllers/rtNewsController.js"

var rtNewsRouter = express.Router()

// ---------------------------------------------------
// Real Time News Routes
// ---------------------------------------------------
// GET catalogue home page
rtNewsRouter.get("/", index)

// Prepare the RTNews table in the database
// rtNewsRouter.post("/prepareRTNewsTable", prepareEmptyRTNewsTable)

// GET all RT News Items from the database
rtNewsRouter.get("/getRTNewsData", getNewsItemsFromDatabase)

export default rtNewsRouter
