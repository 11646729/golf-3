import express from "express"
import nodeCron from "node-cron"
import Producer from "./producer.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"
import { generateMockWeatherData } from "./generateMockWeatherData.js"

const producer = new Producer()

const app = express()

const indexCount = 1

nodeCron.schedule("*/5 * * * * *", () => {
  const calendarMessage = "This is a Calendar message"
  const mockWeatherMessage = generateMockWeatherData("weather", indexCount)
  const newsMessage = "This is a News message"

  producer.publishMessage("calendar", calendarMessage)
  producer.publishMessage("weather", mockWeatherMessage)
  producer.publishMessage("news", newsMessage)

  indexCount++
  console.log(mockWeatherMessage)
})

app.listen(rabbitMQ.port, () => {
  console.log("Mock data Server started...")
})
