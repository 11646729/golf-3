import { google } from "googleapis"
import dotenv from "dotenv"
import fs from "fs"
import moment from "moment"

// import createCalendarEvent from "../gcEventStructure.js"
import { DatabaseAdapter } from "../databaseUtilities.js"

dotenv.config({ quiet: true })

// Database adapter for PostgreSQL
const db = new DatabaseAdapter()

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
export const prepareEmptyRTCalendarTable = async (req, res) => {
  try {
    // Check if rtcalendar table exists using PostgreSQL system tables
    const tableExists = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rtcalendar'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete all values
      console.log("rtcalendar table exists")
      await deleteRTCalendarEvents()
    } else {
      // Else create table
      console.log("rtcalendar table does not exist")
      await createRTCalendarTable()
    }

    res.send({ message: "RTCalendar table prepared successfully" })
  } catch (error) {
    console.error("Error in prepareEmptyRTCalendarTable:", error.message)
    res.status(500).send({ error: "Failed to prepare RTCalendar table" })
  }
}

// -------------------------------------------------------
// Local function to create empty RTCalendar Table in the database
// -------------------------------------------------------
const createRTCalendarTable = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS rtcalendar (
        eventid SERIAL PRIMARY KEY, 
        DTSTAMP TEXT NOT NULL, 
        event_description TEXT NOT NULL
      )
    `

    await db.run(sql)
    console.log("Empty rtCalendar table created")
  } catch (error) {
    console.error("Error in createRTCalendarTable:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Local function to delete all RTCalendar records from Table in database
// -------------------------------------------------------
const deleteRTCalendarEvents = async () => {
  try {
    // Count the records in the database
    const countResult = await db.get(
      "SELECT COUNT(eventid) AS count FROM rtcalendar"
    )

    if (countResult && countResult.count > 0) {
      // Delete all the data in the rtcalendar table
      await db.run("DELETE FROM rtcalendar")
      console.log("All rtcalendar data deleted")

      // Reset the sequence (PostgreSQL equivalent of sqlite_sequence)
      await db.run("ALTER SEQUENCE rtcalendar_eventid_seq RESTART WITH 1")
      console.log("RTCalendar ID sequence reset to 1")
    } else {
      console.log("rtcalendar table was empty (so no data deleted)")
    }
  } catch (error) {
    console.error("Error in deleteRTCalendarEvents:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Import RTCalendar Events from a File to the Table in the Database
// Path: localhost:4000/api/rtcalendar/importRTCalendarEventsFromFile
// -------------------------------------------------------
export const importRTCalendarEventsFromFile = async (req, res) => {
  try {
    // Fetch all the RTCalendar events
    const data = await fs.promises.readFile(
      process.env.RAW_RTCALENDAR_DATA_FILEPATH,
      "utf8"
    )

    // Save the data in the rtcalendar Table in the PostgreSQL database
    const calendarEvents = JSON.parse(data)
    await populateRTCalendarTable(calendarEvents)

    res.send({ message: "RTCalendar events imported successfully" })
  } catch (error) {
    console.error("Error in importRTCalendarEventsFromFile:", error.message)
    res.status(500).send({ error: "Failed to import RTCalendar events" })
  }
}

// -------------------------------------------------------
// Local function for importRTCalendarDataFromFile
// -------------------------------------------------------
const populateRTCalendarTable = async (calendarEvents) => {
  try {
    let insertedCount = 0

    for (const calendarEvent of calendarEvents.tableData) {
      const event = [
        calendarEvent.eventid,
        calendarEvent.DTSTAMP,
        calendarEvent.event_description,
      ]

      const sql = `
        INSERT INTO rtcalendar (eventid, DTSTAMP, event_description) 
        VALUES (?, ?, ?)
      `

      await db.run(sql, event)
      insertedCount++
    }

    console.log("No of new Calendar Events created & saved:", insertedCount)
    return insertedCount
  } catch (error) {
    console.error("Error in populateRTCalendarTable:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Get all RTCalendar Events from database
// Path: localhost:4000/api/rtcalendar/getRTCalendarEvents
// -------------------------------------------------------
export const getRTCalendarEvents = async (req, res) => {
  try {
    const sql = "SELECT * FROM rtcalendar ORDER BY eventid"
    const results = await db.all(sql)

    res.send(results)
  } catch (error) {
    console.error("Error in getRTCalendarEvents:", error.message)
    res.status(500).send({ error: "Failed to fetch RTCalendar events" })
  }
}

// -------------------------------------------------------
// Insert new event to Google Calendar
// -------------------------------------------------------
const insertEvent = (event) => {
  // Provide the required configuration
  const credentials = JSON.parse(process.env.CREDENTIALS)
  const calendarId = process.env.CALENDAR_ID
  const scope = "https://www.googleapis.com/auth/calendar"
  const calendar = google.calendar({ version: "v3" })

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scope
  )

  try {
    let response = calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event,
    })

    if (response["status"] === 200 && response["statusText"] === "OK") {
      return 1
    } else {
      return 0
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`)
    return 0
  }
}

// -------------------------------------------------------
// Fetch calendar data from the Google Calendar
// -------------------------------------------------------
export const insertGoogleCalendarEvent = async (req, res) => {
  let startTime = moment("2023-09-01").format()
  let endTime = moment("2023-09-01").add(1, "months").format()
  let timeZone = "Europe/London"

  // Prepare Google Calendar Event
  let event = {
    summary: `This is the summary.`,
    description: `This is the description.`,
    start: {
      dateTime: startTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endTime,
      timeZone: timeZone,
    },
  }

  insertEvent(event)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}

// -------------------------------------------------------
// TODO - Delete an event from eventID from the Google Calendar
// -------------------------------------------------------
const deleteEvent = async (eventId) => {
  // Provide the required configuration
  const credentials = JSON.parse(process.env.CREDENTIALS)
  const calendarId = process.env.CALENDAR_ID
  const scope = "https://www.googleapis.com/auth/calendar"
  const calendar = google.calendar({ version: "v3" })

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scope
  )

  try {
    let response = await calendar.events.delete({
      auth: auth,
      calendarId: calendarId,
      eventId: eventId,
    })

    if (response.data === "") {
      return 1
    } else {
      return 0
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`)
    return 0
  }
}

// -------------------------------------------------------
// Delete an event from eventID from the Google Calendar
// -------------------------------------------------------
export const deleteGoogleCalendarEvent = async (req, res) => {
  // Provide the required eventId
  let eventId = "rnki5eqkae4gjpoojlh49493dg"

  deleteEvent(eventId)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}

// -------------------------------------------------------
// Fetch all calendar events between two dates from the Google Calendar
// -------------------------------------------------------
export const getGoogleCalendarEvents = async () => {
  // Provide the required configuration
  const credentials = JSON.parse(process.env.CREDENTIALS)
  const scope = "https://www.googleapis.com/auth/calendar"
  const calendar = google.calendar({ version: "v3" })

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scope
  )

  const calendarId = process.env.CALENDAR_ID
  let startTime = moment().subtract(1, "months").format()
  let endTime = moment().add(1, "days").format()
  let timeZone = "Europe/London"

  return await calendar.events
    .list({
      auth: auth,
      calendarId: calendarId,
      timeMin: startTime,
      timeMax: endTime,
      timeZone: timeZone,
    })
    .then((response) => response.data.items)
    .catch((error) => console.log("Error in getAndSaveRTNewsData: ", error))
}

// -------------------------------------------------------
// Socket Emit calendar events data to be consumed by the client
// -------------------------------------------------------
export const emitCalendarEventsData = (
  socket,
  calendarEvents,
  stillLoading
) => {
  // Guard clauses
  if (socket == null) return
  if (calendarEvents == null) return
  if (stillLoading == null) return

  try {
    socket.emit("FromCalendarEventsAPI", calendarEvents)
    socket.emit("FromIsLoadingCalendarEvents", false)
  } catch (error) {
    console.log("Error in emitCalendarEventsData: ", error)
  }
}

// -------------------------------------------------------
// Fetch list of calendars from Google Calendar
// -------------------------------------------------------
const getCalendarList = async () => {
  // Provide the required configuration
  const credentials = JSON.parse(process.env.CREDENTIALS)
  const scope = "https://www.googleapis.com/auth/calendar"
  const calendar = google.calendar({ version: "v3" })

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scope
  )

  try {
    let response = await calendar.calendarList.list({
      auth: auth,
      maxResults: 100,
    })

    let items = response["data"]["items"]
    return items
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`)
    return 0
  }
}

// -------------------------------------------------------
// Fetch list of calendars from the Google Calendar
// -------------------------------------------------------
export const getGoogleCalendarList = async (req, res) => {
  getCalendarList()
    .then((results) => {
      console.log(results)
      // res.send(results)
    })
    .catch((err) => {
      console.log(err)
    })
}

export default getGoogleCalendarEvents
