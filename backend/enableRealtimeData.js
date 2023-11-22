import nodeCron from "node-cron"
import {
  emitTemperatureData,
  getOpenWeatherData,
  reformatTemperatureValue,
} from "./controllers/rtWeatherController.js"
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
  let Heartbeat,
    CalendarEventsInterval,
    TemperatureInterval,
    NewsHeadlinesInterval

  io.on("connection", (socket) => {
    console.log("New client connected")
    if (TemperatureInterval) {
      Heartbeat.stop()
      CalendarEventsInterval.stop()
      TemperatureInterval.stop()
      NewsHeadlinesInterval.stop()
    }

    Heartbeat = nodeCron.schedule("*/1 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getApiAndEmit(socket)
    })

    CalendarEventsInterval = nodeCron.schedule("*/1 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getCalendarEventsApiAndEmit(socket)
    })

    TemperatureInterval = nodeCron.schedule("*/1 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getTemperatureApiAndEmit(socket)
    })

    NewsHeadlinesInterval = nodeCron.schedule("*/2 * * * * *", () => {
      // Do whatever you want in here. Send email, Make  database backup or download data.
      getNewsHeadlinesApiAndEmit(socket)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected")
      Heartbeat.stop()
      CalendarEventsInterval.stop()
      TemperatureInterval.stop()
      NewsHeadlinesInterval.stop()
    })
  })

  // -----------------------------
  // 1 second tick clock
  // -----------------------------
  const getApiAndEmit = (socket) => {
    const response = new Date()
    // Emitting a 1 second heartbeat
    socket.emit("Heartbeat", response)
  }

  // -----------------------------
  // Fetch Google Calendar Events data
  // -----------------------------
  const getCalendarEventsApiAndEmit = (socket) => {
    getGoogleCalendarEvents().then((result) => {
      saveCalendarEvents(result)
      // Emit 2 events isLoading & sendData to client
      emitCalendarEventsData(socket, result, false)
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
      saveNewsHeadlinesItems(result)
      // Emit 2 events isLoading & sendData to client
      emitNewsHeadlinesData(socket, result, false)
    })
  }

  // -----------------------------
  // Fetch Temperature data
  // -----------------------------
  const getTemperatureApiAndEmit = (socket) => {
    const weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.CGC_LATITUDE}&lon=${process.env.CGC_LONGITUDE}&exclude=alerts&units=imperial&appid=${process.env.OPEN_WEATHER_KEY}`
    getOpenWeatherData(weatherDataUrl).then((result) => {
      let temperatureReadings = reformatTemperatureValue(result)
      saveTemperatureValue(temperatureReadings)
      // Emit 2 events isLoading & sendData to client
      emitTemperatureData(socket, temperatureReadings, false)
    })
  }

  const saveCalendarEvents = (result) => {
    // console.log("Test of saveCalendarEvents function " + result)
  }

  const saveNewsHeadlinesItems = (result) => {
    // console.log("Test of saveNewsHeadlinesItems function " + result)
  }

  const saveTemperatureValue = (result) => {
    // console.log("Test of saveTemperatureValue function " + result)
  }
}
