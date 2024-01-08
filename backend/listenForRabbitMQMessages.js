// Management Console
// http://localhost:15672

import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtNewsMSconfig.js"
import { emitTemperatureData } from "./controllers/rtWeatherController.js"
import { emitNewsHeadlinesData } from "./controllers/rtNewsController.js"

export const listenForRabbitMQMessages = (io) => {
  amqp.connect(rabbitMQ.exchangeUrl, (error, connection) => {
    if (error) {
      console.log("Fatal Error - Cannot connect to exchange")
      throw error
    }

    // var amqpConnection = amqp.createConnection(amqpConnectionDetails);
    // amqpConnection.on('ready', function(){
    //   var exchange = amqpConnection.exchange('some_exchange', {'passive':true});
    //   exchange.on('error', function(error) {
    //     done();
    //    });
    //    exchange.on('open', function(exchange) {
    //      throw("exchange exists!")
    //      done();
    //    });
    //  });

    connection.createChannel((error1, channel) => {
      if (error1) {
        console.log("Fatal Error - Cannot create a channel to exchange")
        throw error1
      }

      channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType, {
        durable: false,
      })

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

      io.on("connection", (socket) => {
        console.log("New RabbitMQ client connected")
        console.log(socket.id)

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

              // Emit 2 events isLoading & sendData to client
              try {
                if (contents != null) {
                  // Emit 2 events isLoading & sendData to client
                  emitNewsHeadlinesData(socket, contents.message, false)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages1: ", error)
              }

              // console.log("===== Receive =====")
              // console.log(contents)
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
                  emitTemperatureData(socket, contents.message, false)
                }
              } catch (error) {
                console.log("Error in listenForRabbitMQMessages1: ", error)
              }

              // console.log("===== Receive =====")
              // console.log(contents)
            }
            // })
          },
          {
            noAck: true,
          }
        )

        // socket.on("disconnect", () => {
        //   console.log("Client disconnected")
        // })
      })
    })
  })
}
