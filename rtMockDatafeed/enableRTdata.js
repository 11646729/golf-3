import nodeCron from "node-cron"
import Producer from "./producer.js"
import { generateMockWeatherData } from "./generateMockWeatherData.js"

const enableRTdata = () => {
  const producer = new Producer()

  const indexCount = 1

  nodeCron.schedule("*/5 * * * * *", () => {
    const calendarMessage = "This is a Calendar message"
    const mockWeatherMessage = generateMockWeatherData("weather", indexCount)
    const newsMessage = "This is a News message"

    producer.publishMessage("calendar", calendarMessage)
    producer.publishMessage("weather", mockWeatherMessage)
    producer.publishMessage("news", newsMessage)

    indexCount++
  })
}

export default enableRTdata
