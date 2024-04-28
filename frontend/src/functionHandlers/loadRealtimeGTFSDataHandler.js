import axios from "axios"

// -------------------------------------------------------
// Function to fetch Realtime GTFS data into the SQL database
// -------------------------------------------------------
export const loadRealtimeGTFSDataHandler = async () => {
  const url = "http://localhost:4000/api/gtfs/updateRealtimeGTFSData"
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

// -------------------------------------------------------
// Function to start Regular Updates of Realtime GTFS data
// -------------------------------------------------------
export const startRegularUpdatesOfRealtimeGTFSDataHandler = async () => {
  const url =
    "http://localhost:4000/api/gtfs/startRegularUpdatesOfRealtimeGTFSData"
  const params = {}
  const config = {
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
  }

  await axios
    .post(url, params, config)
    // .then(() => alert("Realtime GTFS data has been Imported to SQL database"))
    .catch((err) => console.log(err))
}
