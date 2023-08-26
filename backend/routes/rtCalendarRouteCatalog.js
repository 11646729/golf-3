import express from "express"
import {
  index,
  prepareEmptyRTCalendarTable,
  importRTCalendarEventsFromFile,
  getRTCalendarEvents,
} from "../controllers/rtCalendarController.js"

var rtCalendarRouter = express.Router()

// ---------------------------------------------------
// Real Time Calendar Routes
// ---------------------------------------------------
// GET catalogue home page
rtCalendarRouter.get("/", index)

// Prepare the RTCalendar table in the database
rtCalendarRouter.post("/prepareRTCalendarTable", prepareEmptyRTCalendarTable)

// POST all RT Calendar Events into the database
rtCalendarRouter.get("/importRTCalendarEvents", importRTCalendarEventsFromFile)

// GET all RT Calendar Events from the database
rtCalendarRouter.get("/getRTCalendarEvents", getRTCalendarEvents)

export default rtCalendarRouter
