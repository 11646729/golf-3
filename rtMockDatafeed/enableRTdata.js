import nodeCron from "node-cron"
// import Producer from "./producer.js"
import { publishMessage } from "./producer1.js"
import { generateMockWeatherData } from "./generateMockWeatherData.js"
import { generateMockNewsData } from "./generateMockNewsData.js"
import { generateMockCalendarData } from "./generateMockCalendarData.js"

const enableRTdata = () => {
  // const producer = new Producer()

  let indexCount = 1

  // -----------------------------
  // 1 second tick clock
  // -----------------------------
  nodeCron.schedule("*/1 * * * * *", () => {
    const response = new Date()
    // Emitting a 1 second heartbeat
    publishMessage("heartbeat", response)
  })

  //  Emitting events at 5 second intervals
  nodeCron.schedule("*/5 * * * * *", () => {
    const calendarMessage = generateMockCalendarData(indexCount)
    const mockWeatherMessage = generateMockWeatherData(indexCount)
    const mockNewsMessage = generateMockNewsData(indexCount)

    // producer.publishMessage("calendar", calendarMessage)
    // producer.publishMessage("weather", mockWeatherMessage)
    // producer.publishMessage("news", mockNewsMessage)

    publishMessage("calendar", calendarMessage)
    publishMessage("weather", mockWeatherMessage)
    publishMessage("news", mockNewsMessage)

    indexCount++
  })
}

export default enableRTdata
