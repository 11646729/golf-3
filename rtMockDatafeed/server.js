import express from "express"
import nodeCron from "node-cron"
import Producer from "./producer.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"
import { generateData } from "./generateMockWeatherData.js"

const producer = new Producer()

const app = express()

const indexCount = 1

nodeCron.schedule("*/5 * * * * *", () => {
  const calendarMessage = "This is a Calendar message"
  const mockWeatherMessage = generateData("Weather", indexCount)
  const newsMessage = "This is a News message"

  producer.publishMessage("Calendar", calendarMessage)
  producer.publishMessage("Weather", mockWeatherMessage)
  producer.publishMessage("News", newsMessage)

  indexCount++
  console.log(mockWeatherMessage)
})

app.listen(rabbitMQ.port, () => {
  console.log("Mock data Server started...")
})
