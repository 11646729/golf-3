import cron from "node-cron"
import {
  emitTemperatureData,
  getAndSaveOpenWeatherData,
} from "./controllers/weatherController.js"

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

      console.log(socket.id)

      // -----------------------------
      // Fetch data every Day at 07:00
      // cron.schedule("0 7 * * *", () => {

      // Fetch data every 15 Minutes
      // cron.schedule("*/15 * * * *", () => {

      // Fetch data every Minute
      cron.schedule("*/1 * * * *", () => {
        // -----------------------------
        getAndSaveOpenWeatherData().then((result) => {
          // console.log("OpenWeather temperature: " + result)
          // emitTemperatureData(socket, result)
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
