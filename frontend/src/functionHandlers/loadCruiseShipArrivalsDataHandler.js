import axios from "axios"

// -------------------------------------------------------
// Function to prepare the portarrivals table in the SQL database
// -------------------------------------------------------
const preparePortArrivalsTable = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to prepare the vessels table in the SQL database
// -------------------------------------------------------
const prepareVesselsTable = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Cruise PortArrivals & Vessel data
// -------------------------------------------------------
const importPortArrivalsAndVesselsData = async (url) => {
  const params = { portName: import.meta.env.VITE_PORT_NAME }
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .post(url, params, config)
    .then((returnedData) => returnedData.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Cruise Vessel data
// -------------------------------------------------------
export const getPortArrivalsData = async (url) => {
  const params = { portName: import.meta.env.VITE_PORT_NAME }
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .get(url, params, config)
    .then((returnedData) => returnedData.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to store all Cruise PortArrivals & Vessel data in the SQL database
// -------------------------------------------------------
export const loadCruiseShipArrivalsDataHandler = () => {
  // Prepare empty port arrivals table in the database & show result
  preparePortArrivalsTable(
    "http://localhost:4000/api/cruise/preparePortArrivalsTable"
  )

  // Prepare empty vessels table in the database & show result
  prepareVesselsTable("http://localhost:4000/api/cruise/prepareVesselsTable")

  // Import the scraped data into the database & show result
  importPortArrivalsAndVesselsData(
    "http://localhost:4000/api/cruise/importPortArrivalsAndVesselsData"
  )
}

export { getPortArrivalsData as default }
