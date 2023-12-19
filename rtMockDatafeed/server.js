import express from "express"
import nodeCron from "node-cron"
import Producer from "./producer.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"

const producer = new Producer()

const app = express()

nodeCron.schedule("*/5 * * * * *", () => {
  // Do whatever you want in here. Send email, Make  database backup or download data.
  const calendarMessage = "This is a Calendar message"
  const newsMessage = "This is a News message"
  const weatherMessage = [
    {
      index: 1,
      timeNow: new Date().toISOString(),
      version: "1.0",
      readingTime: "2023-12-18T09:48:28.000Z",
      location: "Clandeboye Golf Course",
      temperatureValue: 52.29,
      latitude: "54.665577",
      longitude: "-5.766897",
    },
  ]

  producer.publishMessage("Calendar", calendarMessage)
  producer.publishMessage("Weather", weatherMessage)
  producer.publishMessage("News", newsMessage)
})

app.listen(rabbitMQ.port, () => {
  console.log("Mock data Server started...")
})
