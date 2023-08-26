import axios from "axios"

// -------------------------------------------------------
// Function to fetch all RT Calendar data - DON'T TRY TO REFACTOR THIS
// -------------------------------------------------------
// export const getRTCalendarData = async (url, key) => {
//   var options = {
//     method: "GET",
//     url: url, //"https://api.newscatcherapi.com/v2/search",
//     params: { q: "Bitcoin", lang: "en", sort_by: "relevancy", page: "1" },
//     headers: {
//       "x-api-key": key, //"your_key_1",
//     },
//   }

//   return await axios
//     .request(options)
//     // .then((response) => response.data)
//     .then(function (response) {
//       console.log(response.data)
//     })
//     // .catch((err) => console.log(err))
//     .catch(function (error) {
//       console.error(error)
//     })
// }

// -------------------------------------------------------
// Function to prepare the RTCalendar table in the database
// -------------------------------------------------------
const prepareRTCalendarTable = async (url) => {
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
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTCalendar data
// -------------------------------------------------------
export const getRTCalendarEvents = async (url) => {
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
  prepareRTCalendarTable(
    "http://localhost:4000/api/rtcalendar/prepareRTCalendarTable"
  )

  // Initial import of the RTCalendar file data into the database
  importRTCalendarEventsFromFile(
    "http://localhost:4000/api/rtcalendar/importRTCalendarEventsFromFile"
  )
}

export { getRTCalendarEvents as default }
