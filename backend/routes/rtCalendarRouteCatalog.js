import express from "express"
import {
  index,
  // prepareEmptyRTCalendarTable,
  getRTCalendarEvents,
} from "../controllers/rtCalendarController.js"

var rtCalendarRouter = express.Router()

// ---------------------------------------------------
// Real Time Calendar Routes
// ---------------------------------------------------
// GET catalogue home page
rtCalendarRouter.get("/", index)

// Prepare the RTCalendar table in the database
// rtCalenderRouter.post("/prepareRTCalendarTable", prepareEmptyRTCalendarTable)

// GET all RT Calendar Events from the database
rtCalendarRouter.get("/getRTCalendarEvents", getRTCalendarEvents)

export default rtCalendarRouter
