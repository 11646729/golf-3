import cron from "node-cron"
import {
  emitTemperatureData,
  getOpenWeatherData,
} from "./controllers/rtWeatherController.js"
import { emitNewsData, getNewsItems } from "./controllers/rtNewsController.js"

// -------------------------------------------------------
// TO WORK PROPERLY FRONTEND MUST BE SWITCH ON BEFORE BACKEND
// -------------------------------------------------------
export var switchOnRealtimeData = (io, switchOn) => {
  if (switchOn) {
    // Using socket.io for realtime data transmission
    var roomno = 1

    io.on("connection", (socket) => {
      // Join a room
      socket.join("room-" + roomno)
      console.log("Room No: " + roomno + " Joined & Client Connected")

      // -----------------------------
      // Fetch data every Minute
      cron.schedule("*/1 * * * *", () => {
        // -----------------------------
        const weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.CGC_LATITUDE}&lon=${process.env.CGC_LONGITUDE}&exclude=alerts&units=imperial&appid=${process.env.OPEN_WEATHER_KEY}`

        getOpenWeatherData(weatherDataUrl).then((result) => {
          let temperatureReadings = reformatTemperatureValue(result)
          // TODO - Save data in the Database
          saveTemperatureValue(temperatureReadings)
          emitTemperatureData(socket, temperatureReadings)
        })
      })

      // -----------------------------
      // Fetch data every 2 Minutes
      cron.schedule("*/1 * * * *", () => {
        // -----------------------------
        const liveNewsTopHeadlinesUrl =
          "https://newsapi.org/v2/top-headlines" +
          "?sources=bbc-news" +
          "&apiKey=" +
          process.env.RT_NEWS_API

        // let currentDate = moment().format()
        //.format("YYYY-MM-DD")
        // let timeNow = new Date().toISOString()
        // console.log(currentDate)
        // console.log(timeNow)

        getNewsItems(liveNewsTopHeadlinesUrl).then((result) => {
          // TODO - Save data in the Database
          saveNewsItems(result)
          emitNewsData(socket, result)
        })
      })

      socket.on("disconnect", () => {
        // Leave the room
        socket.leave("room-" + roomno)
        console.log("Left Room No: " + roomno + " & Client Disconnected")
      })
    })
  } else {
    return "Realtime data disabled"
  }
}

const saveNewsItems = (result) => {
  // console.log("Test of saveNewsItems function " + result)
}

const saveTemperatureValue = (result) => {
  // console.log("Test of saveTemperatureValue function " + result)
}

const reformatTemperatureValue = (result) => {
  // Guard clause
  if (result == null) return

  // let timeNow = new Date().toISOString()

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
