import axios from "axios"

// -------------------------------------------------------
// Function to prepare the seismicdesigns table in the SQL database
// -------------------------------------------------------
const prepareSeismicDesignsTable = async (url) => {
  return await axios
    .post(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to instruct backend to load Seismic Designs Data into the database
// -------------------------------------------------------
const initialImportOfSeismicDesignsData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Seismic Designs data - DON'T TRY TO REFACTOR THIS
// -------------------------------------------------------
export const getSeismicDesignsData = async (url) => {
  return await axios
    .get(url)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Seismic Designs data into the SQL database
// -------------------------------------------------------
export const loadSeismicDesignsDataHandler = () => {
  // Prepare empty seismicdesigns table in the database & show result
  prepareSeismicDesignsTable(
    "http://localhost:4000/api/golf/prepareSeismicDesignsTable"
  )

  // Initial import of the Seismic Designs file data into the database
  initialImportOfSeismicDesignsData(
    "http://localhost:4000/api/golf/importSeismicDesignsData"
  )
}

export { getSeismicDesignsData as default }
