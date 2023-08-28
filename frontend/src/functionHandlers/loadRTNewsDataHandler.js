import axios from "axios"

// -------------------------------------------------------
// Function to fetch all RT News data - DON'T TRY TO REFACTOR THIS
// -------------------------------------------------------
// export const getRTNewsData = async (url, key) => {
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
// Function to prepare the empty RTNews table in the database
// -------------------------------------------------------
const prepareEmptyRTNewsTable = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to instruct backend to load RTNews Items into the database
// -------------------------------------------------------
const importRTNewsItemsFromFile = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTNews Items
// -------------------------------------------------------
export const getRTNewsItems = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTNews Items into the database
// -------------------------------------------------------
export const loadRTNewsItemsHandler = () => {
  // Prepare empty RTNews table in the database & show result
  prepareEmptyRTNewsTable(
    "http://localhost:4000/api/rtcalendar/prepareEmptyRTNewsTable"
  )
  // Initial import of the RTNews Items file data into the database
  importRTNewsItemsFromFile(
    "http://localhost:4000/api/rtcalendar/importRTNewsItemsFromFile"
  )
}

export { getRTNewsItems as default }
