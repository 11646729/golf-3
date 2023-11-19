import nodeCron from "node-cron"
import { getOpenWeatherData } from "./controllers/rtWeatherController.js"
import {
  emitNewsHeadlinesData,
  getNewsHeadlinesItems,
} from "./controllers/rtNewsController.js"
import {
  emitCalendarEventsData,
  getGoogleCalendarEvents,
} from "./controllers/rtCalendarController.js"

// -------------------------------------------------------
// TO WORK PROPERLY FRONTEND MUST BE SWITCH ON BEFORE BACKEND
// -------------------------------------------------------
export var enableRealtimeData = (io) => {
  // -------------------------------------------------------------------
  // From socket-io code
  // -------------------------------------------------------------------
  let TemperatureInterval, NewsInterval

  io.on("connection", (socket) => {
    console.log("New client connected")
    if (TemperatureInterval) {
      TemperatureInterval.stop()
      NewsInterval.stop()
    }

    TemperatureInterval = nodeCron.schedule("*/1 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getApiAndEmit(socket)
      getTemperatureApiAndEmit(socket)
    })

    NewsInterval = nodeCron.schedule("*/2 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getNewsHeadlinesApiAndEmit(socket)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected")
      TemperatureInterval.stop()
      NewsInterval.stop()
    })
  })

  // -----------------------------
  // 1 second tick clock
  // -----------------------------
  const getApiAndEmit = (socket) => {
    const response = new Date()
    // Emitting a 1 second heartbeat
    socket.emit("FromAPI", response)
  }

  // -----------------------------
  // Fetch Temperature data
  // -----------------------------
  const getTemperatureApiAndEmit = (socket) => {
    const weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.CGC_LATITUDE}&lon=${process.env.CGC_LONGITUDE}&exclude=alerts&units=imperial&appid=${process.env.OPEN_WEATHER_KEY}`
    getOpenWeatherData(weatherDataUrl).then((result) => {
      let temperatureReadings = reformatTemperatureValue(result)
      // TODO - Save data in the Database
      // saveTemperatureValue(temperatureReadings)
      socket.emit("FromIsLoadingTemperatureData", false)
      socket.emit("FromTemperatureAPI", temperatureReadings)
    })
  }

  // -----------------------------
  // Fetch News Headline data
  // -----------------------------
  const getNewsHeadlinesApiAndEmit = (socket) => {
    const liveNewsTopHeadlinesUrl =
      "https://newsapi.org/v2/top-headlines" +
      "?sources=bbc-news" +
      "&apiKey=" +
      process.env.RT_NEWS_API

    // let currentDate = moment().format().format("YYYY-MM-DD")
    // let timeNow = new Date().toISOString()
    // console.log(currentDate)
    // console.log(timeNow)

    getNewsHeadlinesItems(liveNewsTopHeadlinesUrl).then((result) => {
      // TODO - Save data in the Database
      // saveNewsItems(result)
      socket.emit("FromIsLoadingNewsHeadlinesData", false)
      emitNewsHeadlinesData(socket, result)
    })
  }

  // -------------------------------------------------------------------
  //  // -----------------------------
  // Fetch Calendar Event data every Minute
  // cron.schedule("*/1 * * * *", () => {
  //   // -----------------------------
  //   getGoogleCalendarEvents().then((result) => {
  //     // TODO - Save data in the Database
  //     saveCalendarEvents(result)
  //     emitCalendarEventsData(socket, result)
  //   })
  // })

  // const saveCalendarEvents = (result) => {
  //   // console.log("Test of saveCalendarEvents function " + result)
  // }

  // const saveNewsItems = (result) => {
  //   // console.log("Test of saveNewsItems function " + result)
  // }

  // const saveTemperatureValue = (result) => {
  //   // console.log("Test of saveTemperatureValue function " + result)
  // }

  // -------------------------------------------------------
  // Function to refactor Temperature Value
  // -------------------------------------------------------
  const reformatTemperatureValue = (result) => {
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
}
