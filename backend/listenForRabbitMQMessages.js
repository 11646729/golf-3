import { connect } from "amqplib"
import { rabbitMQ } from "./rtNewsMSconfig.js"

// async function listenForRabbitMQMessages() {
export const listenForRabbitMQMessages = async () => {
  const connection = await connect(rabbitMQ.exchangeUrl)
  const channel = await connection.createChannel()

  await channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType)

  const qc = await channel.assertQueue("CalendarQueue")
  await channel.bindQueue(qc.queue, rabbitMQ.exchangeName, "Calendar")
  console.log(qc.queue + " queue created")

  const qn = await channel.assertQueue("NewsQueue")
  await channel.bindQueue(qn.queue, rabbitMQ.exchangeName, "News")
  console.log(qn.queue + " queue created")

  const qw = await channel.assertQueue("WeatherQueue")
  await channel.bindQueue(qw.queue, rabbitMQ.exchangeName, "Weather")
  console.log(qw.queue + " queue created")

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

  channel.consume(qw.queue, (msg) => {
    const data = JSON.parse(msg.content)
    console.log(data)
    channel.ack(msg)
  })
}
