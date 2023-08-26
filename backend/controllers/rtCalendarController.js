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
export const prepareEmptyRTCalendarTable = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_schema table to check if golfcourses table exists
    let sql =
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'rtcalendar'"

    // Must use db.all not db.run
    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("rtcalendar table exists")
        deleteRTCalendarEvents(db)
      } else {
        // Else create table
        console.log("rtcalendar table does not exist")
        createRTCalendarTable(db)
      }
    })

    res.send("Returned Data")
  } else {
    console.error("Cannot connect to database")
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Local function to create empty RTCalendar Table in the database
// -------------------------------------------------------
const createRTCalendarTable = (db) => {
  // IF NOT EXISTS isn't really necessary in next line
  const sql =
    "CREATE TABLE IF NOT EXISTS rtcalendar (eventid INTEGER PRIMARY KEY AUTOINCREMENT, DTSTAMP TEXT NOT NULL, event TEXT NOT NULL)"
  let params = []

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    db.run(sql, params, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Empty rtCalendar table created")
    })
  } catch (e) {
    console.error("Error in createRTCalendarTable: ", e.message)
  }
}

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
const populateRTCalendarTable = (events) => {}

// -------------------------------------------------------
// Get all RTCalender Events from database
// Path: localhost:4000/api/rtcalendar/getRTCalendarEvents
// -------------------------------------------------------
export const getRTCalendarEvents = (req, res) => {
  console.log("I am Here")
  return dummyCalendarEvents
}

export default getRTCalendarEvents
