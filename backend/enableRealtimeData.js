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
export const enableRealtimeData = (io) => {
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
      // Sample result
      // -------------
      // {
      //   coord: { lon: -5.6839, lat: 54.6255 },
      //   weather: [ { id: 500, main: 'Rain', description: 'light rain', icon: '10d' } ],
      //   base: 'stations',
      //   main: {
      //     temp: 49.82,
      //     feels_like: 43.66,
      //     temp_min: 49.44,
      //     temp_max: 50.67,
      //     pressure: 1004,
      //     humidity: 85
      //   },
      //   visibility: 10000,
      //   wind: { speed: 18.41, deg: 290, gust: 32.21 },
      //   rain: { '1h': 0.15 },
      //   clouds: { all: 75 },
      //   dt: 1703153732,
      //   sys: {
      //     type: 2,
      //     id: 2008547,
      //     country: 'GB',
      //     sunrise: 1703148200,
      //     sunset: 1703174273
      //   },
      //   timezone: 0,
      //   id: 2656396,
      //   name: 'Bangor',
      //   cod: 200
      // }

      let temperatureReadings = reformatTemperatureValue(result)

      // Emit 2 events isLoading & sendData to client
      emitTemperatureData(socket, temperatureReadings, false)
    })
  }
}
