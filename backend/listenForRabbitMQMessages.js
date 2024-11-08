// Management Console
// http://localhost:15672
// username: guest
// password: guest

import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtNewsMSconfig.js"
import { emitTemperatureData } from "./controllers/rtWeatherController.js"
import { emitNewsHeadlinesData } from "./controllers/rtNewsController.js"
import { emitCalendarEventsData } from "./controllers/rtCalendarController.js"
import { emitHeartbeatData } from "./controllers/rtHeartbeatController.js"

export const listenForRabbitMQMessages = (io) => {
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
        durable: true, // false causes a crash
      })

      channel.assertQueue(
        "heartbeatQueue",
        {
          durable: false,
        },
        (error2, qh) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a heartbeatQueue")
            throw error2
          }
          console.log("heartbeatQueue created & bound to exchange")
          channel.bindQueue(qh.queue, rabbitMQ.exchangeName, "heartbeat")
        }
      )

      channel.assertQueue(
        "calendarQueue",
        {
          durable: false,
        },
        (error2, qc) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a calendarQueue")
            throw error2
          }
          console.log("calendarQueue created & bound to exchange")
          channel.bindQueue(qc.queue, rabbitMQ.exchangeName, "calendar")
        }
      )

      channel.assertQueue(
        "newsQueue",
        {
          durable: false,
        },
        (error2, qn) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a newsQueue")
            throw error2
          }
          console.log("newsQueue created & bound to exchange")
          channel.bindQueue(qn.queue, rabbitMQ.exchangeName, "news")
        }
      )

      channel.assertQueue(
        "weatherQueue",
        {
          durable: false,
        },
        (error2, qw) => {
          if (error2) {
            console.log("Fatal Error - Cannot create a weatherQueue")
            throw error2
          }
          console.log("weatherQueue created & bound to exchange")
          channel.bindQueue(qw.queue, rabbitMQ.exchangeName, "weather")
        }
      )

      // ---------------------------------------------------------
      // COMMENT OUT THE NEXT LINE TO TEST RECEIPT OF THE MESSAGES
      io.on("connection", (socket) => {
        // ---------------------------------------------------------

        console.log("New RabbitMQ client connected")
        channel.consume(
          "heartbeatQueue",
          (payload) => {
            if (payload != null) {
              let contents = JSON.parse(payload.content)
              // Emit 2 events isLoading & sendData to client
              try {
                if (contents != null) {
                  // Emit 2 events isLoading & sendData to client
                  // emitHeartbeatData(socket, contents.message, false)
                  console.log("===== Receive =====")
                  console.log(contents.message)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages: ", error)
              }
            }
          },
          {
            noAck: true,
          }
        )

        channel.consume(
          "calendarQueue",
          (payload) => {
            if (payload != null) {
              let contents = JSON.parse(payload.content)
              // Emit 2 events isLoading & sendData to client
              try {
                if (contents != null) {
                  // Emit 2 events isLoading & sendData to client
                  // emitCalendarEventsData(socket, contents.message, false)
                  console.log("===== Receive =====")
                  console.log(contents.message)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages: ", error)
              }
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
              // Emit 2 events isLoading & sendData to client
              try {
                if (contents != null) {
                  // Emit 2 events isLoading & sendData to client
                  // emitNewsHeadlinesData(socket, contents.message, false)
                  console.log("===== Receive =====")
                  console.log(contents.message)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages: ", error)
              }
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
              // Emit 2 events isLoading & sendData to client
              try {
                if (contents != null) {
                  // emitTemperatureData(socket, contents.message, false)
                  console.log("===== Receive =====")
                  console.log(contents.message)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages: ", error)
              }
            }
          },
          {
            noAck: true,
          }
        )
      })

      // ---------------------------------------------------------
    })
    // ---------------------------------------------------------
  })
}
