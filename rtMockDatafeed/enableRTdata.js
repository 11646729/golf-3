import nodeCron from "node-cron"
import { publishMessage } from "./producer.js"
import { generateMockWeatherData } from "./generateMockWeatherData.js"
import { generateMockNewsData } from "./generateMockNewsData.js"
import { generateMockCalendarData } from "./generateMockCalendarData.js"

const enableRTdata = () => {
  let indexCount = 1

  // Emitting a 1 second heartbeat
  nodeCron.schedule("*/1 * * * * *", () => {
    const response = new Date()
    publishMessage("heartbeat", response)
  })

  //  Emitting events at 5 second intervals
  nodeCron.schedule("*/5 * * * * *", () => {
    const calendarMessage = generateMockCalendarData(indexCount)
    const mockWeatherMessage = generateMockWeatherData(indexCount)
    const mockNewsMessage = generateMockNewsData(indexCount)

    publishMessage("calendar", calendarMessage)
    publishMessage("weather", mockWeatherMessage)
    publishMessage("news", mockNewsMessage)

    indexCount++
  })
}

export default enableRTdata
