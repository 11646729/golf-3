import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"
import { dummyCalendarEvents } from "../raw_data/data.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/rtcalendar/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Real Time Calendar Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty RTCalendar Table ready to import events
// Path: localhost:4000/api/rtcalendar/prepareEmptyRTCalendarTable
// -------------------------------------------------------
export const prepareEmptyRTCalendarTable = (req, res) => {}

// -------------------------------------------------------
// Local function to create empty RTCalendar Table in the database
// -------------------------------------------------------
const createRTCalendarTable = (db) => {}

// -------------------------------------------------------
// Local function to delete all RTCalendar records from Table in database
// -------------------------------------------------------
const deleteRTCalendarEvents = (db) => {}

// -------------------------------------------------------
// Import RTCalendar Events from a File to the Table in the Database
// Path: localhost:4000/api/rtcalendar/importRTCalendarEventsFromFile
// -------------------------------------------------------
export const importRTCalendarEventsFromFile = (req, res) => {}

// -------------------------------------------------------
// Local function for importRTCalendarDataFromFile
// -------------------------------------------------------
const populateRTCalendarTable = (courses) => {}

// -------------------------------------------------------
// Get all RTCalender Events from database
// Path: localhost:4000/api/rtcalendar/getRTCalendarEvents
// -------------------------------------------------------
export const getRTCalendarEvents = (req, res) => {
  console.log("I am Here")
  return dummyCalendarEvents
}

export default getRTCalendarEvents
