import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { createServer } from "http"
import { Server } from "socket.io"
import { switchOnRealtimeData } from "./enableRealtimeData.js"

const port = process.env.EXPRESS_SERVER_PORT || 4000

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: "*" } })

const __dirname = path.resolve()

// Routers use Controllers as per Express Tutorial
import rtCalendarRouter from "./routes/rtCalendarRouteCatalog.js"
import rtNewsRouter from "./routes/rtNewsRouteCatalog.js"
import golfRouter from "./routes/golfRouteCatalog.js"
import rtWeatherRouter from "./routes/rtWeatherRouteCatalog.js"
import cruiseRouter from "./routes/cruiseRouteCatalog.js"
import busRouter from "./routes/busRouteCatalog.js"
import seismicDesignsRouter from "./routes/seismicDesignsRouteCatalog.js"

dotenv.config()

// cors settings from https://blog.jscrambler.com/setting-up-5-useful-middlewares-for-an-express-api/
app.use(
  cors({
    origin: ["http://localhost:" + process.env.REACT_SERVER_PORT],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/rtcalendar", rtCalendarRouter)
app.use("/api/rtnews", rtNewsRouter)
app.use("/api/golf", golfRouter)
app.use("/api/weather", rtWeatherRouter)
app.use("/api/cruise", cruiseRouter)
app.use("/api/bus", busRouter)
app.use("/api/seismicdesigns", seismicDesignsRouter)

// Added on 23-10-2022
// This returns a default response for any other request
app.use((req, res) => {
  res.status(404)
})

io.on("connection", (socket) => {
  console.log("Server-Sent: a user connected")
})

// Enable Realtime data sending system
switchOnRealtimeData(io)

// Start Express server
httpServer.listen(port, (err) => {
  if (err) {
    throw err
  } else {
    console.log("Server running on port: " + port)
  }
})
