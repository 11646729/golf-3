import express from "express"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"
import enableRTdata from "./enableRTdata.js"

const app = express()

enableRTdata()

app.listen(rabbitMQ.port, () => {
  console.log("Mock data Server started...")
})
