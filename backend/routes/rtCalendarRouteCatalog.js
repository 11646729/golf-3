import express from "express"
import {
  index,
  createRTCalendarTable,
  importRTCalendarEventsFromFile,
  getGoogleCalendarEvents,
  getGoogleCalendarList,
} from "../controllers/rtCalendarController.js"

var rtCalendarRouter = express.Router()

// ---------------------------------------------------
// Real Time Calendar Routes
// ---------------------------------------------------
// GET catalogue home page
rtCalendarRouter.get("/", index)

// Prepare the RTCalendar table in the database
rtCalendarRouter.post(
  "/createRTCalendarTable",
  createRTCalendarTable
)

// POST all RT Calendar Events into the database
rtCalendarRouter.post(
  "/importRTCalendarEventsFromFile",
  importRTCalendarEventsFromFile
)

// GET all Google Calendar Data
rtCalendarRouter.get("/getGoogleCalendarEvents", getGoogleCalendarEvents)

// GET all Google Calendars
rtCalendarRouter.get("/getGoogleCalendarList", getGoogleCalendarList)

export default rtCalendarRouter
