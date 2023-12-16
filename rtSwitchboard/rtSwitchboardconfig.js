export const rabbitMQ = {
  url: "amqp://localhost:5672",
  exchangeName: "rtExchange",
  exchangeType: "direct",
}

// From https://jluccisano.github.io/computer/push-data-on-rabbitmq/
// rabbitmq:
//     url: amqp://guest:guest@RABBIT_DOCKER_HOST:5672
//     gatewayId: raspberry_1
//     sendFrom: RASPBERRY_IP_ADDRESS
//     exchange: events
//     publish_interval: 60
//     queue: event
//     logPath: /var/log/dht22

// environment:
//       - PORT=8084
//       - RABBITMQ_ENDPOINT=amqp://rabbit_user:rabbit_password@rabbitmq:5672/myvhost
//       - RABBITMQ_EXCHANGE=your_exchange_name
//       - RABBITMQ_QUEUE=your_queue_name
//       - RABBITMQ_GATEWAYID=your_gateway_id
//       - INFLUXDB_URL=http://influxdb:8086
//       - INFLUXDB_USERNAME=influx_username
//       - INFLUXDB_PASSWORD=influx_password
//       - INFLUXDB_DATABASE=influx_db_name
//       - INFLUXDB_RETENTION_POLICY=influx_rp_name
