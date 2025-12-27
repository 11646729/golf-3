import axios from "axios"

// -------------------------------------------------------
// Function to prepare the golfcourses table in the SQL database
// -------------------------------------------------------
const prepareGolfCoursesTable = async (url) => {
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
// Function to instruct backend to load Golf Club Data into the database
// -------------------------------------------------------
const initialImportOfGolfCoursesData = async (url) => {
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
// Function to fetch all Golf Course data - DON'T TRY TO REFACTOR THIS
// -------------------------------------------------------
export const getGolfCoursesData = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .get(url, config)
    .then((response) => response.data)
    .catch((err) => console.log(err))
}

// -------------------------------------------------------
// Function to fetch all Golf Courses data into the SQL database
// -------------------------------------------------------
export const loadGolfCoursesDataHandler = () => {
  // Prepare empty golf courses table in the database & show result
  prepareGolfCoursesTable(
    "http://localhost:4000/api/golf/createGolfCoursesTable"
  )

  // Initial import of the golf course file data into the database
  initialImportOfGolfCoursesData(
    "http://localhost:4000/api/golf/importGolfCoursesData"
  )
}

export { getGolfCoursesData as default }
