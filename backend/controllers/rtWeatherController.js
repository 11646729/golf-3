import axios from "axios"
import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL - created lazily to avoid startup connection spam
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

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
export const createTemperaturesTable = async (req, res) => {
  try {
    // Check if temperatures table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'temperatures'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete all values
      console.log("temperatures table exists")
      await deleteTemperatures()
    } else {
      // Else create table
      console.log("temperatures table does not exist")
      await createTemperaturesTableStructure()
    }

    if (res) {
      res.send({ message: "Temperature table prepared successfully" })
    }
  } catch (error) {
    console.error("Error in createTemperaturesTable:", error.message)
    if (res) {
      res.status(500).send({ error: "Failed to prepare temperature table" })
    }
  }
}

// -------------------------------------------------------
// Create temperatures Table in PostgreSQL Database
// -------------------------------------------------------
const createTemperaturesTableStructure = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS temperatures (
        temperatureid SERIAL PRIMARY KEY, 
        timenow TEXT NOT NULL, 
        databaseversion INTEGER, 
        timeofmeasurement TEXT NOT NULL, 
        locationname TEXT NOT NULL, 
        locationtemperature REAL, 
        lng REAL CHECK( lng >= -180 AND lng <= 180 ), 
        lat REAL CHECK( lat >= -90 AND lat <= 90 )
      )
    `

    await getDb().run(sql)
    console.log("temperatures table successfully created")
  } catch (error) {
    console.error("Error creating temperatures table:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Delete all temperatures records from PostgreSQL database
// -------------------------------------------------------
const deleteTemperatures = async () => {
  try {
    // Count the records in the database
    const countResult = await getDb().get(
      "SELECT COUNT(temperatureid) AS count FROM temperatures"
    )

    if (countResult && countResult.count > 0) {
      // Delete all the data in the temperatures table
      await getDb().run("DELETE FROM temperatures")
      console.log("All temperatures data deleted")

      // Reset the sequence (PostgreSQL equivalent of sqlite_sequence)
      await getDb().run(
        "ALTER SEQUENCE temperatures_temperatureid_seq RESTART WITH 1"
      )
      console.log("Temperature ID sequence reset to 1")
    } else {
      console.log("temperatures table was empty (so no data deleted)")
    }
  } catch (error) {
    console.error("Error in deleteTemperatures:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Get all temperatures
// -------------------------------------------------------
export const getTemperaturesFromDatabase = async (req, res) => {
  try {
    // Only fetch <= the last 20 readings
    const sql =
      "SELECT * FROM temperatures ORDER BY temperatureid DESC LIMIT 20"
    const results = await getDb().all(sql)

    console.log("Temperature results:", results.length)
    res.send(results)
  } catch (error) {
    console.error("Error in getTemperaturesFromDatabase:", error.message)
    res.status(500).send({ error: "Failed to fetch temperature data" })
  }
}

// -------------------------------------------------------
// Save temperatures to PostgreSQL database
// -------------------------------------------------------
const saveTemperature = async (temperatureReading) => {
  // Guard clause for null temperatureReading
  if (temperatureReading == null) return

  try {
    const sql = `
      INSERT INTO temperatures (timenow, databaseversion, timeofmeasurement, locationname, locationtemperature, lng, lat) 
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING temperatureid
    `

    const result = await getDb().get(sql, temperatureReading)
    console.log("New id of inserted temperature reading:", result.temperatureid)
    return result.temperatureid
  } catch (error) {
    console.error("Error in saveTemperature:", error.message)
    throw error
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
    socket.emit("FromTemperatureAPI", temperatureReadings)
    socket.emit("FromIsLoadingTemperatureData", stillLoading)
  } catch (error) {
    console.log("Error in emitTemperatureData: ", error)
  }
}

// Make saveTemperature available for external use
export { saveTemperature }

export default getTemperaturesFromDatabase
