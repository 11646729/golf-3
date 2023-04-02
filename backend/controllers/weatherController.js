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
    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
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

      db.all(sql, [], (err) => {
        if (err) {
          return console.error(err.message)
        }
        console.log("temperatures table successfully created")
      })

      // Disconnect from the SQLite database
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
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

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the temperatures table
        const sql1 = "DELETE FROM temperatures"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All temperatures data deleted")
        })

        // Reset the id number
        const sql2 =
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'temperatures'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log(
            "In sqlite_sequence table temperatures seq number set to 0"
          )
        })
      } else {
        console.log("temperatures table was empty (so no data deleted)")
      }
    })
  } catch (err) {
    console.error("Error in deleteTemperatures: ", err.message)
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

      db.all(sql, [], (err, results) => {
        if (err) {
          return console.error(err.message)
        }
        // console.log("Results: ", results.length)

        res.send(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
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
    } catch (err) {
      console.error("Error in saveTemperature: ", err)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

// -------------------------------------------------------
// Fetch weather data from the Dark Skies website
// -------------------------------------------------------
export const getAndSaveOpenWeatherData = async () => {
  const weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.CGC_LATITUDE}&lon=${process.env.CGC_LONGITUDE}&exclude=alerts&units=imperial&appid=${process.env.OPEN_WEATHER_KEY}`
  const timeNow = new Date().toISOString()

  try {
    // fetch data from the url endpoint and return it
    const response = await axios.get(weatherDataUrl)

    // Reformat data into Transient object
    const temperatureReading = [
      timeNow,
      process.env.DATABASE_VERSION,
      unixToUtc(response.data.dt),
      "Clandeboye Golf Course",
      response.data.main.temp,
      process.env.HOME_LATITUDE,
      process.env.HOME_LONGITUDE,
    ]

    // Save data in the Database
    saveTemperature(temperatureReading)

    return temperatureReading
  } catch (err) {
    console.log("Error in getAndSaveOpenWeatherData: ", err)
  }
}

// -------------------------------------------------------
// Socket Emit temperature data to be consumed by the client
// -------------------------------------------------------
export const emitTemperatureData = (socket, weatherData) => {
  // Guard clauses
  if (socket == null) return
  if (weatherData == null) return

  // console.log("Ready to emit temperature: " + weatherData)

  try {
    socket.emit("DataFromOpenWeatherAPI", weatherData)
  } catch (err) {
    console.log("Error in emitTemperatureData: ", err)
  }
}

// -------------------------------------------------------
// Function to convert Unix timestamp to UTC
// -------------------------------------------------------
const unixToUtc = (timestamp) => {
  return new Date(timestamp * 1000).toJSON()
}

export default getTemperaturesFromDatabase
