import express from "express"
import nodeCron from "node-cron"
import Producer from "./producer.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"

const producer = new Producer()

const app = express()

const indexCount = 1
const precision = 100 // 2 decimals

nodeCron.schedule("*/5 * * * * *", () => {
  const calendarMessage = "This is a Calendar message"

  let randomNum =
    Math.floor(
      Math.random() * (10 * precision - 1 * precision) + 1 * precision
    ) /
    (1 * precision)

  const weatherMessage = [
    {
      index: indexCount,
      version: "1.0",
      readingTime: "2023-12-18T09:48:28.000Z",
      location: "Clandeboye Golf Course",
      temperatureValue: randomNum,
      latitude: "54.665577",
      longitude: "-5.766897",
    },
  ]
  const newsMessage = "This is a News message"

  producer.publishMessage("Calendar", calendarMessage)
  producer.publishMessage("Weather", weatherMessage)
  producer.publishMessage("News", newsMessage)

  indexCount++
  console.log(weatherMessage)
})

app.listen(rabbitMQ.port, () => {
  console.log("Mock data Server started...")
})
