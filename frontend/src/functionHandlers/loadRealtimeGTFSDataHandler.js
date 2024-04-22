import axios from "axios"

// -------------------------------------------------------
// Function to fetch Realtime GTFS data into the SQL database
// -------------------------------------------------------
export const loadRealtimeGTFSDataHandler = async () => {
  // This function prepares an empty database & imports Realtime GTFS Data into local SQL database
  const url = "http://localhost:4000/api/gtfs/importRealtimeGTFSData"
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }
  await axios
    .post(url, params, config)
    .then(() => alert("Realtime GTFS data has been Imported to SQL database"))
    .catch((err) => console.log(err))
}
