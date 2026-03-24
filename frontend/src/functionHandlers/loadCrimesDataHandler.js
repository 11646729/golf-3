import axios from "axios"

// -------------------------------------------------------
// Function to prepare the crimes table in the SQL database
// -------------------------------------------------------
const prepareCrimesTable = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .post(url, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to instruct backend to load Crimes Data into the database
// -------------------------------------------------------
const initialImportOfCrimesData = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .post(url, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Crimes data
// -------------------------------------------------------
export const getCrimesData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Crimes data into the SQL database
// -------------------------------------------------------
export const loadCrimesDataHandler = () => {
  // Prepare empty crimes table in the database & show result
  prepareCrimesTable("http://localhost:4000/api/crimes/createCrimesTable")

  // Initial import of the crimes file data into the database
  initialImportOfCrimesData("http://localhost:4000/api/crimes/importCrimesData")
}

export { getCrimesData as default }
