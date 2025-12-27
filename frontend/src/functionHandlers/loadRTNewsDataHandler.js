import axios from "axios"

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
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all RTNews Items into the database
// -------------------------------------------------------
export const loadRTNewsItemsHandler = () => {
  // Prepare empty RTNews table in the database & show result
  prepareEmptyRTNewsTable("http://localhost:4000/api/rtnews/createRTNewsTable")

  // Initial import of the RTNews Items file data into the database
  importRTNewsItemsFromFile(
    "http://localhost:4000/api/rtnews/importRTNewsItemsFromFile"
  )
}

export { loadRTNewsItemsHandler as default }
