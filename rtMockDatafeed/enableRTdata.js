import nodeCron from "node-cron"
import Producer from "./producer.js"
import { generateMockWeatherData } from "./generateMockWeatherData.js"
import { generateMockNewsData } from "./generateMockNewsData.js"
import { generateMockCalendarData } from "./generateMockCalendarData.js"

const enableRTdata = () => {
  const producer = new Producer()

  const indexCount = 1

  nodeCron.schedule("*/5 * * * * *", () => {
    const calendarMessage = generateMockCalendarData(indexCount)
    const mockWeatherMessage = generateMockWeatherData(indexCount)
    const mockNewsMessage = generateMockNewsData(indexCount)

    producer.publishMessage("calendar", calendarMessage)
    producer.publishMessage("weather", mockWeatherMessage)
    producer.publishMessage("news", mockNewsMessage)

    indexCount++
  })
}

export default enableRTdata
