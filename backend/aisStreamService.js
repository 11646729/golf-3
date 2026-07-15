import WebSocket from "ws"
import { DatabaseAdapter } from "./databaseUtilities.js"

const AIS_STREAM_URL = "wss://stream.aisstream.io/v0/stream"
const RECONNECT_DELAY_INITIAL_MS = 2_000
const RECONNECT_DELAY_MAX_MS = 30_000

// Bounding box covering the Irish Sea and Belfast approaches
// Format: [[minLat, minLng], [maxLat, maxLng]]
const BELFAST_REGION_BOX = [[51.0, -10.0], [56.0, 1.0]]

let geoFilterEnabled = false
let activeWs = null

export function getGeoFilter() {
  return geoFilterEnabled
}

export function setGeoFilter(enabled) {
  geoFilterEnabled = enabled
  console.log(`[AIS] Geographic filter ${enabled ? "enabled" : "disabled"} — reconnecting`)
  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    activeWs.close()
  }
}

export async function startAISStream(io) {
  const db = new DatabaseAdapter()

  try {
    await db.run(`DELETE FROM vesselpositions`)
    console.log("[AIS] Cleared stale vessel positions from previous session")
  } catch (err) {
    console.error("[AIS] Failed to clear vessel positions on startup:", err.message)
  }

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
    activeWs = ws

    ws.on("open", () => {
      console.log(`[AIS] Connected to aisstream.io (geo filter: ${geoFilterEnabled ? "on" : "off"})`)
      reconnectDelay = RECONNECT_DELAY_INITIAL_MS
      const subscribeMsg = {
        APIKey: process.env.AISSTREAM_API_KEY,
        FiltersShipMMSI: mmsiList,
      }
      if (geoFilterEnabled) {
        subscribeMsg.BoundingBoxes = [BELFAST_REGION_BOX]
      }
      ws.send(JSON.stringify(subscribeMsg))
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
        // aisstream.io sends Go time format: "2026-06-26 08:17:15.110794876 +0000 UTC"
        // Strip the trailing " UTC" so PostgreSQL can parse it as timestamptz
        const recordedat = time_utc ? new Date(time_utc.replace(" UTC", "")).toISOString() : new Date().toISOString()
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
            [recordedat, latitude, longitude, sog, cog, heading, navstatus, longitude, latitude, MMSI],
          )
          if (result.changes > 0) {
            console.log(`[AIS] Position updated — MMSI ${MMSI}: lat ${latitude}, lng ${longitude}`)
            const vessel = await db.get(`SELECT vesselname FROM vessels WHERE mmsi = ?`, [MMSI])
            io.emit("vesselPositionUpdated", {
              mmsi: MMSI,
              vesselname: vessel?.vesselname ?? null,
              lat: latitude,
              lng: longitude,
              sog,
              cog,
              heading,
              navstatus,
              recordedat,
            })
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
