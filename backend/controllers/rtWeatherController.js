import axios from "axios"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/weather/
// -------------------------------------------------------
export var index = async (req, res) => {
  res.send({ response: "I am alive" }).status(200)
}

// -------------------------------------------------------
// Prepare empty temperatures Table ready to import data
// -------------------------------------------------------
export const prepareEmptyTemperaturesTable = (req, res) => {
  // Open a Database Connection
  let db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_schema table to check if temperatures table exists
    let sql =
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'temperatures'"

    // Must use db.all not db.run
    db.all(sql, [], (error, results) => {
      if (error) {
        return console.error(error.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("temperatures table exists")
        deleteTemperatures(db)
      } else {
        // Else create table
        console.log("temperatures table does not exist")
        createTemperaturesTable(db)
      }
    })
  } else {
    console.error("Cannot connect to database")
  }

  // Close the Database Connection
  closeSqlDbConnection(db)

  // res.send("prepareEmptyTemperaturesTable return value")
}

// -------------------------------------------------------
// Create temperatures Table in the SQLite Database
// -------------------------------------------------------
const createTemperaturesTable = (req, res) => {
  // Open a Database Connection
  let db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      const sql =
        "CREATE TABLE IF NOT EXISTS temperatures (temperatureid INTEGER PRIMARY KEY AUTOINCREMENT, timenow TEXT NOT NULL, databaseversion INTEGER, timeofmeasurement TEXT NOT NULL, locationname TEXT NOT NULL, locationtemperature REAL, lng REAL CHECK( lng >= -180 AND lng <= 180 ), lat REAL CHECK( lat >= -90 AND lat <= 90 ))"

      db.all(sql, [], (error) => {
        if (error) {
          return console.error(error.message)
        }
        console.log("temperatures table successfully created")
      })

      // Disconnect from the SQLite database
      closeSqlDbConnection(db)
    } catch (error) {
      console.error(error.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Delete all temperatures records from SQLite database
// -------------------------------------------------------
const deleteTemperatures = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Count the records in the database
    const sql = "SELECT COUNT(temperatureid) AS count FROM temperatures"

    db.all(sql, [], (error, result) => {
      if (error) {
        console.error(error.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the temperatures table
        const sql1 = "DELETE FROM temperatures"

        db.all(sql1, [], function (error, results) {
          if (error) {
            console.error(error.message)
          }
          console.log("All temperatures data deleted")
        })

        // Reset the id number
        const sql2 =
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'temperatures'"

        db.run(sql2, [], (error) => {
          if (error) {
            console.error(error.message)
          }
          console.log(
            "In sqlite_sequence table temperatures seq number set to 0"
          )
        })
      } else {
        console.log("temperatures table was empty (so no data deleted)")
      }
    })
  } catch (error) {
    console.error("Error in deleteTemperatures: ", error.message)
  }
}

// -------------------------------------------------------
// Get all temperatures
// -------------------------------------------------------
export const getTemperaturesFromDatabase = (req, res) => {
  // Open a Database Connection
  let db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      // Only fetch <= the last 20 readings
      const sql =
        "SELECT * FROM temperatures ORDER BY temperatureid DESC LIMIT 20"

      db.all(sql, [], (error, results) => {
        if (error) {
          return console.error(error.message)
        }
        // console.log("Results: ", results.length)

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (error) {
      console.error(error.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Save temperatures to SQLite database
// -------------------------------------------------------
const saveTemperature = (temperatureReading) => {
  // Guard clause for null temperatureReading
  if (temperatureReading == null) return

  // Open a Database Connection
  let db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      // Don't change the routine below
      const sql1 =
        "INSERT INTO temperatures (timenow, databaseversion, timeofmeasurement, locationname, locationtemperature, lng, lat) VALUES ($1, $2, $3, $4, $5, $6, $7)"

      db.run(sql1, temperatureReading, function (err) {
        if (err) {
          return console.error(err.message)
        }
        console.log("New id of inserted temperature reading:", this.lastID)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (error) {
      console.error("Error in saveTemperature: ", error)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Fetch weather data from the Dark Skies website
// -------------------------------------------------------
export const getOpenWeatherData = async (weatherDataUrl) => {
  return await axios
    .get(weatherDataUrl)
    .then((response) => response.data)
    .catch((error) => console.log("Error in getAndSaveRTNewsData: ", error))
}

// -------------------------------------------------------
// Function to refactor Temperature Value
// -------------------------------------------------------
export const reformatTemperatureValue = (result) => {
  // Guard clause
  if (result == null) return

  try {
    let temperatureReadings = []
    let latestReading = {
      index: 1,
      timeNow: new Date().toISOString(),
      version: process.env.DATABASE_VERSION,
      readingTime: unixToUtc(result.dt),
      location: "Clandeboye Golf Course",
      temperatureValue: result.main.temp,
      latitude: process.env.HOME_LATITUDE,
      longitude: process.env.HOME_LONGITUDE,
    }
    temperatureReadings.push(latestReading)

    return temperatureReadings
  } catch (error) {
    console.log("Error in reformatTemperatureValue: ", error)
  }
}

// -------------------------------------------------------
// Function to convert Unix timestamp to UTC
// -------------------------------------------------------
const unixToUtc = (timestamp) => {
  return new Date(timestamp * 1000).toJSON()
}

// -------------------------------------------------------
// Socket Emit temperature data to be consumed by the client
// -------------------------------------------------------
export const emitTemperatureData = (
  socket,
  temperatureReadings,
  stillLoading
) => {
  // Guard clauses
  if (socket == null) return
  if (temperatureReadings == null) return
  if (stillLoading == null) return

  try {
    socket.emit("FromIsLoadingTemperatureData", stillLoading)
    socket.emit("FromTemperatureAPI", temperatureReadings)
    console.log("Here")
  } catch (error) {
    console.log("Error in emitTemperatureData: ", error)
  }
}

export default getTemperaturesFromDatabase
