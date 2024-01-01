#!/usr/bin/env node

// Management Console
// http://localhost:15672

import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtNewsMSconfig.js"

export const listenForRabbitMQMessages = () => {
  amqp.connect(rabbitMQ.exchangeUrl, function (error, connection) {
    if (error) {
      throw error
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }

      channel.assertQueue("weatherQueue", {
        durable: true,
      })

      // channel.consume("weatherQueue", (msg) => {
      //   const data = JSON.parse(msg.content)
      //   console.log(data)
      //   channel.ack(msg)
      // })

      channel.consume(
        "weatherQueue",
        function (payload) {
          if (payload != null) {
            let contents = JSON.parse(payload.content)
            console.log("===== Receive =====")
            console.log(contents)
          }
        },
        {
          noAck: true,
        }
      )
    })
  })
}
