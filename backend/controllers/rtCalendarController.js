import { google } from "googleapis"
import dotenv from "dotenv"
import fs from "fs"
import moment from "moment"
// import createCalendarEvent from "../gcEventStructure.js"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

dotenv.config()

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
    "CREATE TABLE IF NOT EXISTS rtcalendar (eventid INTEGER PRIMARY KEY AUTOINCREMENT, DTSTAMP TEXT NOT NULL, event_description TEXT NOT NULL)"
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
const deleteRTCalendarEvents = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // db.serialize(function () {
    // Count the records in the database
    const sql = "SELECT COUNT(eventid) AS count FROM rtcalendar"

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the rtcalendar table
        const sql1 = "DELETE FROM rtcalendar"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All rtcalendar data deleted")
        })

        // Reset the id number
        const sql2 =
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'rtcalendar'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log("In sqlite_sequence table rtcalendar seq number set to 0")
        })
      } else {
        console.log("rtcalendar table was empty (so no data deleted)")
      }
      // })
    })
  } catch (err) {
    console.error("Error in deleteRTCalendarEvents: ", err.message)
  }
}

// -------------------------------------------------------
// Import RTCalendar Events from a File to the Table in the Database
// Path: localhost:4000/api/rtcalendar/importRTCalendarEventsFromFile
// -------------------------------------------------------
export const importRTCalendarEventsFromFile = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Fetch all the RTCalendar events
    fs.readFile(
      process.env.RAW_RTCALENDAR_DATA_FILEPATH,
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err.message)
        }

        // Save the data in the rtcalender Table in the SQLite database
        const calendarEvents = JSON.parse(data)
        populateRTCalendarTable(calendarEvents)
      }
    )
  } catch (err) {
    console.error("Error in importRTCalendarEventsFromFile: ", err.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Local function for importRTCalendarDataFromFile
// -------------------------------------------------------
const populateRTCalendarTable = (calendarEvents) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  let loop = 0
  try {
    do {
      const event = [
        // process.env.DATABASE_VERSION,
        calendarEvents.tableData[loop].eventid,
        calendarEvents.tableData[loop].DTSTAMP,
        calendarEvents.tableData[loop].event_description,
      ]

      const sql =
        "INSERT INTO rtcalendar (eventid, DTSTAMP, event_description) VALUES ($1, $2, $3 )"

      db.run(sql, event, (err) => {
        if (err) {
          console.error(err.message)
        }
      })

      loop++
    } while (loop < calendarEvents.tableData.length)

    console.log("No of new Calendar Events created & saved: ", loop)
  } catch (e) {
    console.error(e.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Get all RTCalender Events from database
// Path: localhost:4000/api/rtcalendar/getRTCalendarEvents
// -------------------------------------------------------
export const getRTCalendarEvents = (req, res) => {
  let sql = "SELECT * FROM rtcalendar ORDER BY eventid"
  let params = []

  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      db.all(sql, params, (err, results) => {
        if (err) {
          res.status(400).json({ error: err.message })
          return
        }
        // res.json({
        //   message: "success",
        //   data: results,
        // })
        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Fetch calendar data from the Google Calendar
// -------------------------------------------------------
export const getAndSaveGoogleCalendarData = async (req, res) => {
  // Provide the required configuration
  const CREDENTIALS = JSON.parse(process.env.CREDENTIALS)
  const calendarId = process.env.CALENDAR_ID

  // Google calendar API settings
  const SCOPES = "https://www.googleapis.com/auth/calendar"
  const calendar = google.calendar({ version: "v3" })

  const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
  )

  // // Insert new event to Google Calendar
  // const insertEvent = async (event) => {
  //   try {
  //     let response = await calendar.events.insert({
  //       auth: auth,
  //       calendarId: calendarId,
  //       resource: event,
  //     })

  //     if (response["status"] === 200 && response["statusText"] === "OK") {
  //       return 1
  //     } else {
  //       return 0
  //     }
  //   } catch (error) {
  //     console.log(`Error at insertEvent --> ${error}`)
  //     return 0
  //   }
  // }

  // let dateTime = dateTimeForCalendar()

  // // Event for Google Calendar
  // let event = {
  //   summary: `This is the summary.`,
  //   description: `This is the description.`,
  //   start: {
  //     dateTime: dateTime["start"],
  //     timeZone: "Europe/London",
  //   },
  //   end: {
  //     dateTime: dateTime["end"],
  //     timeZone: "Europe/London",
  //   },
  // }

  // let tempEvent = createCalendarEvent()

  // insertEvent(tempEvent)
  //   .then((res) => {
  //     console.log(res)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  // Get all the events between two dates
  const getEvents = async (dateTimeStart, dateTimeEnd) => {
    try {
      let response = await calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone: "Europe/London",
      })

      let items = response["data"]["items"]
      return items
    } catch (error) {
      console.log(`Error at getEvents --> ${error}`)
      return 0
    }
  }

  let start = moment("2023-09-01").format()
  let end = moment("2023-09-01").add(1, "months").format()

  getEvents(start, end)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })

  // // Delete an event from eventID
  // const deleteEvent = async (eventId) => {
  //   try {
  //     let response = await calendar.events.delete({
  //       auth: auth,
  //       calendarId: calendarId,
  //       eventId: eventId,
  //     })

  //     if (response.data === "") {
  //       return 1
  //     } else {
  //       return 0
  //     }
  //   } catch (error) {
  //     console.log(`Error at deleteEvent --> ${error}`)
  //     return 0
  //   }
  // }

  // let eventId = "rnki5eqkae4gjpoojlh49493dg"

  // deleteEvent(eventId)
  //   .then((res) => {
  //     console.log(res)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })
}

export default getRTCalendarEvents
