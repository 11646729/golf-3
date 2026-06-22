import WebSocket from "ws"
import { DatabaseAdapter } from "./databaseUtilities.js"

const AIS_STREAM_URL = "wss://stream.aisstream.io/v0/stream"
const RECONNECT_DELAY_INITIAL_MS = 2_000
const RECONNECT_DELAY_MAX_MS = 30_000

// Bounding box covering the Irish Sea and Belfast approaches
// Format: [[minLat, minLng], [maxLat, maxLng]]
const BELFAST_REGION_BOX = [[51.0, -10.0], [56.0, 1.0]]

export async function startAISStream() {
  const db = new DatabaseAdapter()
  let reconnectDelay = RECONNECT_DELAY_INITIAL_MS

  const connect = async () => {
    let mmsiList = []
    try {
      const rows = await db.all(`SELECT mmsi FROM vessels WHERE mmsi != 0`)
      mmsiList = rows.map((r) => String(r.mmsi))
      console.log(`[AIS] Loaded ${mmsiList.length} vessel MMSI number(s) from database`)
    } catch (err) {
      console.error("[AIS] Failed to load MMSIs from database:", err.message)
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX_MS)
      return
    }

    if (mmsiList.length === 0) {
      console.log("[AIS] No MMSI numbers in database — skipping AIS stream connection")
      return
    }

    const ws = new WebSocket(AIS_STREAM_URL)

    ws.on("open", () => {
      console.log("[AIS] Connected to aisstream.io")
      reconnectDelay = RECONNECT_DELAY_INITIAL_MS
      ws.send(
        JSON.stringify({
          APIKey: process.env.AISSTREAM_API_KEY,
          BoundingBoxes: [BELFAST_REGION_BOX],
          FiltersShipMMSI: mmsiList,
        }),
      )
    })

    ws.on("message", async (data) => {
      let msg
      try {
        msg = JSON.parse(data)
      } catch {
        console.error("[AIS] Failed to parse message:", data)
        return
      }

      if (msg.MessageType === "PositionReport") {
        const { MMSI, latitude, longitude, time_utc } = msg.MetaData
        const report = msg.Message?.PositionReport ?? {}
        const sog       = report.Sog               ?? null
        const cog       = report.Cog               ?? null
        const heading   = report.TrueHeading        ?? null
        const navstatus = report.NavigationalStatus?.toString() ?? null

        try {
          const result = await db.run(
            `INSERT INTO vesselpositions (vesselid, recordedat, latitude, longitude, sog, cog, heading, navstatus, geom)
             SELECT vesselid, ?, ?, ?, ?, ?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)
             FROM vessels WHERE mmsi = ?
             ON CONFLICT (vesselid) DO UPDATE SET
               recordedat = EXCLUDED.recordedat,
               latitude   = EXCLUDED.latitude,
               longitude  = EXCLUDED.longitude,
               sog        = EXCLUDED.sog,
               cog        = EXCLUDED.cog,
               heading    = EXCLUDED.heading,
               navstatus  = EXCLUDED.navstatus,
               geom       = EXCLUDED.geom`,
            [time_utc, latitude, longitude, sog, cog, heading, navstatus, longitude, latitude, MMSI],
          )
          if (result.changes > 0) {
            console.log(`[AIS] Position updated — MMSI ${MMSI}: lat ${latitude}, lng ${longitude}`)
          }
        } catch (err) {
          console.error(`[AIS] DB update failed for MMSI ${MMSI}:`, err.message)
        }
      }
    })

    ws.on("error", (err) => {
      console.error("[AIS] WebSocket error:", err.message)
    })

    ws.on("close", () => {
      console.log(`[AIS] Connection closed — reconnecting in ${reconnectDelay / 1000}s`)
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX_MS)
    })
  }

  connect()
}
