import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { createServer } from "http"
import { Server } from "socket.io"
import { enableRealtimeData } from "./enableRealtimeData.js"
// import { setupRabbitMQAndEmitMessages } from "./setupRabbitMQAndEmitMessages.js"

// Routers use Controllers as per Express Tutorial
import rtCalendarRouter from "./routes/rtCalendarRouteCatalog.js"
import rtNewsRouter from "./routes/rtNewsRouteCatalog.js"
import golfRouter from "./routes/golfRouteCatalog.js"
import rtWeatherRouter from "./routes/rtWeatherRouteCatalog.js"
import cruiseRouter from "./routes/cruiseRouteCatalog.js"
import gtfsTransportRouter from "./routes/gtfsTransportRouteCatalog.js"
import seismicDesignsRouter from "./routes/seismicDesignsRouteCatalog.js"

const port = process.env.EXPRESS_SERVER_PORT || 4000

const app = express()
const httpServer = createServer(app)

const __dirname = path.resolve()

dotenv.config()

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Implementing CORS on Express
// cors settings from https://blog.jscrambler.com/setting-up-5-useful-middlewares-for-an-express-api/
app.use(
  cors({
    // Changed to allow PORT 3006 for rabbitMQ rtSwitchboard data to pass
    origin: [
      "http://localhost:" + process.env.REACT_SERVER_PORT,
      "http://localhost:3006",
    ],
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
)

// -----------------------------------------------------
// Fetch External Data
// Analyse it and if it is new then send it to the frontend
// -----------------------------------------------------

// Routes
app.use("/api/rtcalendar", rtCalendarRouter)
app.use("/api/rtnews", rtNewsRouter)
app.use("/api/golf", golfRouter)
app.use("/api/weather", rtWeatherRouter)
app.use("/api/cruise", cruiseRouter)
app.use("/api/gtfs", gtfsTransportRouter)
app.use("/api/seismicdesigns", seismicDesignsRouter)

// This returns an error HTML response code for any other request
app.use((req, res) => {
  res.status(404)
})

// Implementing CORS on Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:" + process.env.REACT_SERVER_PORT,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  },
})

// -----------------------------------------------------
// Enable Realtime data sending system
enableRealtimeData(io) // Socket.io system
// setupRabbitMQAndEmitMessages(io) // RabbitMQ system
// -----------------------------------------------------

// Start Express server
httpServer.listen(port, (err) => {
  if (err) {
    throw err
  } else {
    console.log("Server running on port: " + port)
  }
})
