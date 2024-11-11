import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"

export const publishMessage = (routingKey, message) => {
  amqp.connect(rabbitMQ.url, (error0, connection) => {
    if (error0) {
      throw error0
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1
      }

      channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType, {
        durable: true,
      })

      const envelopeDetails = {
        messageType: routingKey,
        message: message,
        dateTime: new Date(),
      }

      channel.publish(
        rabbitMQ.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(envelopeDetails))
      )

      console.log(
        `The new ${routingKey} string is sent to exchange ${rabbitMQ.exchangeName}`
      )
    })
  })
}
