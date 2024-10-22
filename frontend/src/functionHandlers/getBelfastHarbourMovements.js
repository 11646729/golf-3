import axios from "axios"

// -------------------------------------------------------
// Function to fetch Cruise Vessel Movements to/from Belfast Harbour fromm the SQL database
// -------------------------------------------------------
export const getBelfastHarbourMovementData = async (url) => {
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  return await axios
    .get(url, config)
    .then((returnedData) => returnedData.data)
    .catch((err) => console.log(err))
}
