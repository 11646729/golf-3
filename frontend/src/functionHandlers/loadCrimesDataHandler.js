import axios from "axios"

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
  alert("In loadCrimesDataHandler function")
}

export { getCrimesData as default }
