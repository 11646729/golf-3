#!/usr/bin/env node

// Management Console
// http://localhost:15672

import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtNewsMSconfig.js"

export const listenForRabbitMQMessages = () => {
  amqp.connect(rabbitMQ.exchangeUrl, (error, connection) => {
    if (error) {
      console.log("Fatal Error - Cannot connect to exchange")
      throw error
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        console.log("Fatal Error - Cannot create a channel to exchange")
        throw error1
      }

      channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType, {
        durable: true,
      })

      channel.assertQueue(
        "calendarQueue",
        {
          durable: false,
          // exclusive: true,
        },
        (error2, qc) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a calendarQueue")
            throw error2
          }
          console.log("calendarQueue created & bound to exchange")

          channel.bindQueue(qc.queue, rabbitMQ.exchangeName, "calendarQueue")
        }
      )

      channel.assertQueue(
        "newsQueue",
        {
          durable: false,
          // exclusive: true,
        },
        (error2, qn) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a newsQueue")
            throw error2
          }
          console.log("newsQueue created & bound to exchange")

          channel.bindQueue(qn.queue, rabbitMQ.exchangeName, "newsQueue")
        }
      )

      channel.assertQueue(
        "weatherQueue",
        {
          durable: false,
          // exclusive: true,
        },
        (error2, qw) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a weatherQueue")
            throw error2
          }
          console.log("weatherQueue created & bound to exchange")

          channel.bindQueue(qw.queue, rabbitMQ.exchangeName, "weatherQueue")
        }
      )

      channel.consume(
        "calendarQueue",
        (payload) => {
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

      channel.consume(
        "newsQueue",
        (payload) => {
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

      channel.consume(
        "weatherQueue",
        (payload) => {
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
