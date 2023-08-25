import axios from "axios"
import { dummyNewsEvents } from "../data"

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
// Function to fetch all Real Time News - DON'T TRY TO REFACTOR THIS
// -------------------------------------------------------
export const getRTNewsData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Dummy RT News data
// -------------------------------------------------------
export const getDummyRTNewsData = () => {
  // console.log(dummyNewsEvents)
  return dummyNewsEvents
}

export { getRTNewsData as default }
