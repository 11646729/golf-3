import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"
import { dummyCalendarEvents } from "../raw_data/data.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/rtCalendar/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Real Time Calendar Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Get all Real Time Calender Events from SQLite database
// Path: localhost:4000/api/rtcalendar/getRTCalendarEvents
// -------------------------------------------------------
export const getRTCalendarEvents = (req, res) => {
  console.log("I am Here")
  return dummyCalendarEvents
}
