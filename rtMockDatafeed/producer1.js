import amqp from "amqplib/callback_api.js"
import { rabbitMQ } from "./rtMockDatafeedConfig.js"

//step 1 : Connect to the rabbitmq server
//step 2 : Create a new channel on that connection
//step 3 : Create the exchange
//step 4 : Publish the message to the exchange with a routing key

class Producer {
  // channel

  createChannel = () => {
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
      })
    })
  }

  publishMessage = (routingKey, message) => {
    if (!this.channel) {
      this.createChannel()
    }
  }

  //         channel.assertExchange(rabbitMQ.exchangeName, rabbitMQ.exchangeType, {
  //           durable: false,
  //         })

  //         const envelopeDetails = {
  //           messageType: routingKey,
  //           message: message,
  //           dateTime: new Date(),
  //         }

  //         channel.publish(
  //           exchangeName,
  //           routingKey,
  //           Buffer.from(JSON.stringify(envelopeDetails))
  //         )

  //         console.log(
  //           `The new ${routingKey} string is sent to exchange ${exchangeName}`
  //         )

  //         // console.log("Add code here")
  //       })
  //     })
  //   }
}

export default Producer
