import cron from "node-cron"
import {
  emitTemperatureData,
  getAndSaveOpenWeatherData,
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
        getAndSaveOpenWeatherData().then((result) => {
          // console.log(result.data)
          // emitTemperatureData(socket, result)
        })
      })

      // -----------------------------
      // Fetch data every 2 Minutes
      cron.schedule("*/1 * * * *", () => {
        // -----------------------------
        let liveNewsTopHeadlinesUrl =
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
  console.log("Test of saveNewsItems function " + result)
}
