import axios from "axios"

// -------------------------------------------------------
// Function to prepare the empty RTCalendar table in the database
// -------------------------------------------------------
const prepareEmptyRTCalendarTable = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to instruct backend to load RTCalendar Events into the database
// -------------------------------------------------------
const importRTCalendarEventsFromFile = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTCalendar data
// -------------------------------------------------------
// export const getRTCalendarEvents = async (url) => {
//   return await axios
//     .get(url)
//     .then((response) => response.data)
//     .catch((err) => console.log(err))
// }

// -------------------------------------------------------
// Function to fetch all Google Calendar data
// -------------------------------------------------------
export const getAndSaveGoogleCalendarData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTCalendar Events into the database
// -------------------------------------------------------
export const loadRTCalendarEventsHandler = () => {
  // Prepare empty RTCalendar table in the database & show result
  prepareEmptyRTCalendarTable(
    "http://localhost:4000/api/rtcalendar/prepareEmptyRTCalendarTable"
  )
  // Initial import of the RTCalendar file data into the database
  importRTCalendarEventsFromFile(
    "http://localhost:4000/api/rtcalendar/importRTCalendarEventsFromFile"
  )
}

export { getAndSaveGoogleCalendarData as default }
