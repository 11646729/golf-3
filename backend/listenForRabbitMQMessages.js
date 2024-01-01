import { connect } from "amqplib"
import { rabbitMQ } from "./rtNewsMSconfig.js"
import { emitTemperatureData } from "./controllers/rtWeatherController.js"

// async function listenForRabbitMQMessages() {
export const listenForRabbitMQMessages = async (io) => {
  const connection = await connect(rabbitMQ.exchangeUrl)
  const channel = await connection.createChannel()

  await channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType)

  const qc = await channel.assertQueue("calendarQueue")
  await channel.bindQueue(qc.queue, rabbitMQ.exchangeName, "calendar")
  // console.log(qc.queue + " queue created")

  const qn = await channel.assertQueue("newsQueue")
  await channel.bindQueue(qn.queue, rabbitMQ.exchangeName, "news")
  // console.log(qn.queue + " queue created")

  const qw = await channel.assertQueue("weatherQueue")
  await channel.bindQueue(qw.queue, rabbitMQ.exchangeName, "weather")
  // console.log(qw.queue + " queue created")

  // channel.consume(qc.queue, (msg) => {
  //   const data = JSON.parse(msg.content)
  //   console.log(data)
  //   channel.ack(msg)
  // })

  // channel.consume(qn.queue, (msg) => {
  //   const data = JSON.parse(msg.content)
  //   console.log(data)
  //   channel.ack(msg)
  // })

  io.on("connection", (socket) => {
    console.log("New RabbitMQ client connected")
  })

  channel.consume(qw.queue, (msg) => {
    const data = JSON.parse(msg.content)

    // Emit 2 events isLoading & sendData to client
    // emitTemperatureData(socket, data, false)

    console.log(data)
    channel.ack(msg)
  })
}
