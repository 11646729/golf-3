import express from "express"
import { createServer } from "http"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"
import enableRabbitMQSendingData from "./enableRabbitMQSendingData.js"

const app = express()
const httpServer = createServer(app)

enableRabbitMQSendingData()

// Start Express server
httpServer.listen(rabbitMQ.port, (err) => {
  if (err) {
    throw err
  } else {
    console.log("Mock data Server running on port: " + rabbitMQ.port)
  }
})
