import cron from "node-cron"
import {
  emitTemperatureData,
  getAndSaveOpenWeatherData,
} from "./controllers/rtWeatherController.js"
import {
  emitNewsData,
  getAndSaveRTNewsItems,
} from "./controllers/rtNewsController.js"

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
      // cron.schedule("*/1 * * * *", () => {
      //   // -----------------------------
      //   getAndSaveOpenWeatherData().then((result) => {
      //     // console.log("OpenWeather temperature: " + result)
      //     emitTemperatureData(socket, result)
      //   })
      // })

      // -----------------------------
      // Fetch data every 2 Minutes
      cron.schedule("*/1 * * * *", () => {
        // -----------------------------
        getAndSaveRTNewsItems().then((result) => {
          // console.log(result)
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
