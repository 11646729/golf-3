import nodeCron from "node-cron"
import {
  emitCalendarEventsData,
  getGoogleCalendarEvents,
} from "./controllers/rtCalendarController.js"
import {
  emitTemperatureData,
  getOpenWeatherData,
  reformatTemperatureValue,
} from "./controllers/rtWeatherController.js"
import {
  emitNewsHeadlinesData,
  getNewsHeadlinesItems,
} from "./controllers/rtNewsController.js"
// import { formatMessage } from "./formatMessage.js"

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

    if (
      Heartbeat ||
      CalendarEventsInterval ||
      TemperatureInterval ||
      NewsHeadlinesInterval
    ) {
      Heartbeat.stop()
      CalendarEventsInterval.stop()
      TemperatureInterval.stop()
      NewsHeadlinesInterval.stop()
    }

    Heartbeat = nodeCron.schedule("*/1 * * * * *", () => {
      getApiAndEmit(socket)
    })

    CalendarEventsInterval = nodeCron.schedule("*/1 * * * * *", () => {
      getCalendarEventsApiAndEmit(socket)
    })

    TemperatureInterval = nodeCron.schedule("*/1 * * * * *", () => {
      getTemperatureApiAndEmit(socket)
    })

    NewsHeadlinesInterval = nodeCron.schedule("*/2 * * * * *", () => {
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
      // let message = formatMessage(result)
      // console.log(message)

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

      // Emit 2 events isLoading & sendData to client
      emitTemperatureData(socket, temperatureReadings, false)
    })
  }
}
